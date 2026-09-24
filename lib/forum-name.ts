const NAME_KEY = "franklynsForumName";

export function loadForumName(): string {
  try {
    return localStorage.getItem(NAME_KEY) || "";
  } catch {
    return "";
  }
}

export function saveForumName(name: string) {
  try {
    localStorage.setItem(NAME_KEY, name);
  } catch {}
}
