/**
 * Default emojis for each type based on https://gitmoji.dev/
 * - except for refactor due to its narrower rendering in most terminals
 */
export const details = {
  chore: {
    description: "Other changes that don't modify src or test files",
    emoji: "🤖",
  },
  ci: {
    description: "Changes to CI configuration files and scripts",
    emoji: "👷",
  },
  docs: {
    description: "Add or update documentation",
    emoji: "📝",
  },
  feat: {
    description: "A new feature",
    emoji: "✨",
  },
  fix: {
    description: "Fix a bug",
    emoji: "🐛",
  },
  perf: {
    description: "Improve performance",
    emoji: "⚡️",
  },
  refactor: {
    description: "Refactor code",
    emoji: "🔄",
  },
  release: {
    description: "Deploy stuff",
    emoji: "🚀",
  },
  revert: {
    description: "Revert changes",
    emoji: "⏪",
  },
  style: {
    description: "Improve structure / format of the code",
    emoji: "🎨",
  },
  test: {
    description: "Add or update tests",
    emoji: "✅",
  },
} as const;
