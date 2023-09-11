import fs from "fs";

const FILE_PATH = "./notified_ids.json";

export function getNotifiedIds(): number[] {
  if (!fs.existsSync(FILE_PATH)) {
    return [];
  }

  const data = fs.readFileSync(FILE_PATH, "utf-8");
  return JSON.parse(data);
}

export function storeNotifiedId(id: number): void {
  const ids = getNotifiedIds();
  ids.push(id);
  fs.writeFileSync(FILE_PATH, JSON.stringify(ids));
}
