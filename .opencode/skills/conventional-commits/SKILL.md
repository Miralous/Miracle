---
name: Conventional Commits
description: Load before creating or amending any git commit, merge commit, or pull request. Enforces Conventional Commits 1.0.0 for commit messages, merge messages, and PR titles.
---

# Conventional Commits

Apply this skill to every commit, merge, and pull request in this repository.
It is mandatory, not optional.

## Format

```text
<type>(<scope>)!: <description>
```

- `type`: required, lowercase.
- `scope`: optional, lowercase area name.
- `!`: only for breaking changes.
- `description`: imperative mood, lowercase unless a proper noun, no trailing
  period, aim for 72 characters or fewer.

Allowed types:

| Type       | Use for                                                |
| ---------- | ------------------------------------------------------ |
| `feat`     | user-visible feature                                   |
| `fix`      | bug fix                                                |
| `docs`     | documentation only                                     |
| `style`    | formatting, no behavior change                         |
| `refactor` | code change that neither fixes nor adds a feature      |
| `perf`     | performance improvement                                |
| `test`     | tests                                                  |
| `build`    | build system or dependencies                           |
| `ci`       | CI/CD configuration                                    |
| `chore`    | maintenance, tooling, and merge commits                |
| `revert`   | reverting a previous commit                            |

Use a scope when it clarifies the affected area, for example `card`, `friends`,
`search`, `font`, `theme`, `link`, `ci`, `skill`, or `deps`. Omit the scope when
the change is repository-wide.

## Commit workflow

1. Stage intentionally. Review `git diff --cached --stat` and
   `git diff --cached`; never commit unrelated files.
2. Choose the type and scope from the staged change, not from the branch name.
3. Write the subject and optional body/footer:
   - body explains what changed and why, wrapped at 72 characters;
   - reference footer such as `Refs: #123` or `Closes: #123`;
   - breaking change: add `!` after the type/scope and a
     `BREAKING CHANGE: <impact>` footer.
4. Commit with `git commit -m "<subject>" -m "<body>"`.
5. Verify the subject with `git log -1 --pretty=%s`.
6. If the message is wrong and the commit is not pushed, amend it. If it was
   already pushed, ask the user before rewriting history.

## Merge commits

Never accept Git's default `Merge branch '...'` message. Pass an explicit
message:

```sh
git merge --no-ff <branch> -m "chore(merge): <source> into <target>"
```

Examples:

- `chore(merge): feat/search-animation into main`
- `chore(merge): origin/main into dev`
- `chore(merge): release/v1.2.0 into main`

Use `chore(merge)` for integration merges. Do not rewrite merge commits that
are already pushed unless the user asks.

## Pull requests

- The PR title must use the same format as a commit subject, for example
  `feat(search): animate local search box`.
- When a repository squashes merges, the PR title becomes the commit message,
  so it must already be valid.
- PR body: summary, changes, testing, and breaking changes (or `None`).
- Do not prefix titles with `[WIP]`; open a draft PR instead.
- Verify the final title before creating or updating the PR.

## Validation

Subject regex:

```text
^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-z0-9._/-]+\))?!?: [a-z0-9].+$
```

Reject messages such as `update`, `fix bug`, `changes`, `wip`, or `temp`.
Every subject must state what changed.

## Examples

| Change                                      | Message                                                    |
| ------------------------------------------- | ---------------------------------------------------------- |
| Fix icons disappearing during hover         | `fix(card): keep icons visible during 3D hover effect`     |
| Add avatar mirroring                        | `fix(friends): mirror avatars locally`                     |
| Add this guideline                          | `docs(skill): add conventional commits guideline`          |
| Replace the title font                      | `feat(font): replace serif title font with NType 82`       |
| Remove an exported option                   | `refactor(search)!: drop legacy animation flag` + footer   |

Good subjects:

- `feat(card): keep icons visible during 3D hover effect`
- `fix(friends): mirror avatars locally to avoid ORB warnings`
- `docs(skill): add conventional commits guideline`

Bad subjects:

- `update`
- `Merge branch 'dev'`
- `feat: Added new font.`
