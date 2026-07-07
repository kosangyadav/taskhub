# TaskHub CLI 🚀

A smart command-line task manager with intelligent sorting, priority management, and deadline tracking.

## ✨ Features

- **Smart Sorting**: Automatically prioritizes tasks by urgency and importance
- **Priority Levels**: Signal (high), High (medium), Noise (low) with color coding
- **Deadline Management**: Overdue alerts, relative time display, urgency indicators
- **Status Tracking**: Todo, Doing, Done with visual icons
- **Subtasks**: Organize complex tasks with nested subtasks
- **Filtering**: Filter by status, priority, deadline, tags, or keywords
- **Rich Display**: Beautiful tables, cards, and compact list views
- **Data Safety**: JSON storage with validation and backup

## 📦 Installation

```bash
npm i @kosangyadav/taskhub
```

## 🚀 Quick Start

```bash
# Add your first task
taskhub add "Complete project proposal" "Draft and review the Q4 project proposal" -p signal --due 25-12-2024

# List all tasks (smart sorted)
taskhub list

# List tasks in detailed table view
taskhub list -l

# View specific task details
taskhub list 0
```

## 📚 Usage

### Adding Tasks

```bash
# Basic task
taskhub add "Task title" "Optional description"

# Task with priority and deadline
taskhub add "Important meeting" "Team standup" -p signal --due 24-10-2025

# Task with tags
taskhub add "Code review" "Review PR #123" --tags "development,urgent"

# Add subtask
taskhub add "Research competitors" -p high --sub 0
```

### Listing Tasks

```bash
# Smart-sorted list (default)
taskhub list

# Detailed table view
taskhub list --long

# Filter by status
taskhub list --status todo
taskhub list --status doing
taskhub list --status done

# Filter by priority
taskhub list --priority signal
taskhub list --priority high
taskhub list --priority noise

# Filter by tags
taskhub list --tags "work,urgent"

# Search in titles and descriptions
taskhub list --find "meeting"

# View specific task
taskhub list 5
```

### Updating Tasks

```bash
# Update task status
taskhub update 0 --status doing

# Update priority and deadline
taskhub update 1 --priority signal --due 30-10-2025

# Update title and description
taskhub update 2 --title "New title" --description "Updated description"

# Update subtask
taskhub update 1.0 --sub --status done
```

### Removing Tasks

```bash
# Remove a task
taskhub remove 0

# Remove a subtask
taskhub remove 1.0 --sub

# remove tasks with auto-confirmation
taskhub remove 0 -y

# Force remove without confirmation
taskhub remove 0 --force

# Remove all tasks (with confirmation)
taskhub remove --all
```

## 🎨 Priority System

TaskHub uses a unique 3-tier priority system:

- **Signal** (`#`) - Most important tasks (red)
- **High** (`1`) - Standard priority tasks (orange)
- **Noise** (`0`) - Low priority tasks (gray)

## 🔄 Smart Sorting

Tasks are automatically sorted by:

1. **Overdue Status** - Any overdue task gets priority
2. **Critical Urgency** - Due today/tomorrow override distant priorities
3. **Priority Level** - Signal → High → Noise
4. **Deadline** - Due soon → Due later → No deadline
5. **Status** - Doing → Todo → Done
6. **Creation Order** - Consistent tiebreaker

## 📅 Date Format

All dates use DD-MM-YYYY format:
- `--due 25-12-2024` (Christmas Day 2024)
- `--due 01-01-2025` (New Year 2025)

## 🏷️ Status Icons

- `○` Todo (red)
- `◐` Doing (orange)
- `●` Done (green)

## 📁 Data Storage

Tasks are stored in `~/.config/taskhub/tasks.json` as JSON for easy backup and portability.

## 🔧 Command Reference

### Add Command
```bash
taskhub add <title> [description] [options]

Options:
  --sub <parentID>     Add as subtask to parent
  -s, --status <type>  Set status (todo|doing|done)
  -p, --priority <lvl> Set priority (noise|high|signal)
  -D, --due <date>     Set due date (DD-MM-YYYY)
  --tags <tags>        Comma-separated tags
```

### List Command
```bash
taskhub list [ID] [options]

Options:
  -l, --long           Detailed table view
  -s, --status <type>  Filter by status
  -p, --priority <lvl> Filter by priority
  -D, --due <date>     Filter by due date
  --tags <tags>        Filter by tags
  -f, --find <text>    Search in title/description
```

### Update Command
```bash
taskhub update <ID> [options]

Options:
  --sub                Update subtask (ID format: parentID.subtaskID)
  -s, --status <type>  Update status
  -t, --title <text>   Update title
  -d, --description <text> Update description
  -p, --priority <lvl> Update priority
  -D, --due <date>     Update due date
  --tags <tags>        Update tags
```

### Remove Command
```bash
taskhub remove [ID] [options]

Options:
  --sub                Remove subtask (ID format: parentID.subtaskID)
  -a, --all            Remove all tasks
  -f, --force          Skip confirmation
  -y, --yes            Auto-confirm prompts
```

## 🎯 Examples

### Project Management Workflow

```bash
# Create main project task
taskhub add "Launch new website" "Complete website redesign project" -p signal --due 31-12-2024 --tags "project,website"

# Add subtasks
taskhub add "Design mockups" -p high --sub 0 --tags "design"
taskhub add "Develop frontend" -p high --sub 0 --tags "development"
taskhub add "Setup hosting" -p noise --sub 0 --tags "devops"

# Start working on design
taskhub update 0.0 --sub --status doing

# Check project progress
taskhub list --tags "project"
```

### Daily Task Management

```bash
# Add urgent tasks
taskhub add "Fix critical bug" "Production issue in payment system" -p signal --due 24-10-2025 --tags "urgent,bug"

# Add regular work
taskhub add "Team standup" "Daily team meeting" -p high --due 24-10-2025 --tags "meeting"

# Add personal tasks
taskhub add "Grocery shopping" -p noise --tags "personal"

# View today's priorities
taskhub list --find "24-10-2025"
```

## 📄 License

MIT License - see LICENSE file for details.

## 🐛 Bug Reports

Found a bug? Please open an issue on GitHub with:
- Your operating system
- Node.js version
- Command that caused the issue
- Expected vs actual behavior

## 🔮 Roadmap

- [ ] Task templates
- [ ] Time tracking
- [ ] Team collaboration features
- [ ] Calendar integration
- [ ] Custom sorting options
- [ ] Export/import functionality

---

**Happy task managing!** 🎉

For more help, run `taskhub --help` or `taskhub <command> --help`
