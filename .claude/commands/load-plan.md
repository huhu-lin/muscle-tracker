---
description: 顯示 claude-code-workspace 的載入計畫（自動從 workspace 目錄執行）
---

執行 workspace 的 load-plan 腳本。Workspace 在雲端環境位於 `/tmp/claude-code-workspace`，本機則為 `$HOME/claude-code-workspace`。

```bash
DIR="${CLAUDE_CODE_REMOTE:+/tmp/claude-code-workspace}"
DIR="${DIR:-$HOME/claude-code-workspace}"
cd "$DIR" && bash scripts/load-plan.sh
```
