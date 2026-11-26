"""Tokens, model, time and tool calls per agent of one Claude Code session, read from its transcripts. Read only.

Usage:
  python run_stats.py <project transcript folder> [start time, ISO, e.g. 2026-11-23T11:09:00]
  python run_stats.py --selftest

The transcript folder is ~/.claude/projects/<project path with every character that is not a letter or a digit replaced by ->.
The newest session file in it is the current session; pass a session .jsonl instead to pick an older one.
With a start time, only lines from then on count.
"Processed" = every input token sent to the model (new + cache write + cache read).
"""
import glob
import json
import os
import sys
import tempfile
from datetime import datetime


def ts(text):
    t = datetime.fromisoformat(text.replace("Z", "+00:00"))
    return t if t.tzinfo else t.astimezone()


def load(path, since=None):
    out = []
    with open(path, encoding="utf-8") as f:
        for line in f:
            try:
                o = json.loads(line)
            except json.JSONDecodeError:
                continue
            if since and "timestamp" in o and ts(o["timestamp"]) < since:
                continue
            out.append(o)
    return out


def stats(lines):
    """Tokens per API message (one message id is logged once per content block: keep its last usage), tools, times."""
    seen, tools, times, models = {}, 0, [], set()
    for o in lines:
        if "timestamp" in o:
            times.append(ts(o["timestamp"]))
        if o.get("type") != "assistant":
            continue
        m = o.get("message", {})
        u = m.get("usage") or {}
        if m.get("model") and m["model"] != "<synthetic>":
            models.add(m["model"])
        tools += sum(1 for c in m.get("content", []) if isinstance(c, dict) and c.get("type") == "tool_use")
        prev = seen.get(m.get("id"))
        if not prev or u.get("output_tokens", 0) >= prev.get("output_tokens", 0):
            seen[m.get("id")] = u
    ins = [u.get("input_tokens", 0) + u.get("cache_creation_input_tokens", 0) + u.get("cache_read_input_tokens", 0) for u in seen.values()]
    times.sort()
    busy = sum((b - a).total_seconds() for a, b in zip(times, times[1:]) if (b - a).total_seconds() < 180)
    return {
        "models": ",".join(sorted(m.replace("claude-", "") for m in models)) or "-",
        "turns": len(seen),
        "tools": tools,
        "processed": sum(ins),
        "out": sum(u.get("output_tokens", 0) for u in seen.values()),
        "peak": max(ins, default=0),
        "busy": busy / 60,
    }


def m(n):
    return f"{n / 1e6:.1f}M" if n >= 1e6 else f"{n / 1e3:.0f}k"


def row(name, effort, s):
    return f"| {name} | {s['models']} · {effort} | {s['busy']:.1f} min | {s['turns']} | {s['tools']} | {m(s['processed'])} | {m(s['out'])} | {m(s['peak'])} |"


def report(folder, since=None):
    sessions = [folder] if folder.endswith(".jsonl") else glob.glob(os.path.join(folder, "*.jsonl"))
    if not sessions:
        sys.exit(f"no session file in {folder}")
    session = max(sessions, key=os.path.getmtime)
    main = stats([o for o in load(session, since) if not o.get("isSidechain")])
    rows, total, out = [], main["processed"], main["out"]
    for path in glob.glob(os.path.join(session[:-6], "subagents", "agent-*.jsonl")):
        s = stats(load(path, since))
        if not s["turns"]:
            continue
        meta_path = path[:-6] + ".meta.json"
        meta = json.load(open(meta_path, encoding="utf-8")) if os.path.exists(meta_path) else {}
        name = meta.get("name") or meta.get("description") or meta.get("agentType") or os.path.basename(path)
        if meta.get("parentAgentId"):
            name = f"fork: {meta.get('description') or name}"
        rows.append((s, name, meta.get("effort", "-")))
        total += s["processed"]
        out += s["out"]
    lines = [
        "| Agent | Model · effort | Busy | Turns | Tools | Processed | Output | Peak context |",
        "|---|---|---|---|---|---|---|---|",
        row("Main chat", "-", main),
    ]
    lines += [row(n, e, s) for s, n, e in sorted(rows, key=lambda r: -r[0]["processed"])]
    share = main["processed"] / total * 100 if total else 0
    lines.append(f"| **Total** | | | | | **{m(total)}** | **{m(out)}** | |")
    lines.append(f"\nMain chat share: {share:.0f}%")
    return "\n".join(lines)


def selftest():
    def msg(mid, t, read, out, model="claude-opus-5-5", tool=False, side=False):
        content = [{"type": "tool_use"}] if tool else [{"type": "text"}]
        return json.dumps({"type": "assistant", "timestamp": t, "isSidechain": side, "message": {
            "id": mid, "model": model, "content": content,
            "usage": {"input_tokens": 10, "cache_creation_input_tokens": 0, "cache_read_input_tokens": read, "output_tokens": out}}})

    with tempfile.TemporaryDirectory() as d:
        with open(os.path.join(d, "s1.jsonl"), "w", encoding="utf-8") as f:
            f.write("\n".join([
                msg("a", "2026-01-01T10:00:00Z", 990, 5),
                msg("a", "2026-01-01T10:00:01Z", 990, 20, tool=True),  # same id: counted once, last usage
                msg("b", "2026-01-01T10:01:00Z", 1990, 30),
                msg("x", "2026-01-01T10:01:00Z", 99999, 1, side=True),  # sidechain: not the main chat
                "not json",
            ]))
        os.makedirs(os.path.join(d, "s1", "subagents"))
        with open(os.path.join(d, "s1", "subagents", "agent-w1.jsonl"), "w", encoding="utf-8") as f:
            f.write(msg("w", "2026-01-01T10:02:00Z", 490, 7, model="claude-sonnet-5-5"))
        json.dump({"name": "w1", "effort": "high"}, open(os.path.join(d, "s1", "subagents", "agent-w1.meta.json"), "w"))

        main = stats([o for o in load(os.path.join(d, "s1.jsonl")) if not o.get("isSidechain")])
        assert (main["turns"], main["tools"], main["processed"], main["out"], main["peak"]) == (2, 1, 3000, 50, 2000), main
        later = stats(load(os.path.join(d, "s1.jsonl"), ts("2026-01-01T10:00:30Z")))
        assert later["turns"] == 2 and later["processed"] == 2000 + 100009, later
        text = report(d)
        assert "| w1 | sonnet-5-5 · high |" in text and "Main chat share: 86%" in text, text
        assert report(os.path.join(d, "s1.jsonl")) == text
    print("selftest passed")


if __name__ == "__main__":
    if sys.argv[1:] == ["--selftest"]:
        selftest()
    elif len(sys.argv) in (2, 3):
        print(report(sys.argv[1], ts(sys.argv[2]) if len(sys.argv) == 3 else None))
    else:
        sys.exit(__doc__)
