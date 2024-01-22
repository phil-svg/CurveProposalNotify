import fs from "fs";

const FILE_PATH = "../notified_ids.json";

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

const FILE_PATH_PASSED_VOTES = "../notified_ids_passed_votes.json";

export function getNotifiedIdsPassedVotes(): number[] {
  if (!fs.existsSync(FILE_PATH_PASSED_VOTES)) {
    return [];
  }

  const data = fs.readFileSync(FILE_PATH_PASSED_VOTES, "utf-8");
  return JSON.parse(data);
}

export function storeNotifiedIdPassedVotes(id: number): void {
  const ids = getNotifiedIdsPassedVotes();
  ids.push(id);
  fs.writeFileSync(FILE_PATH_PASSED_VOTES, JSON.stringify(ids));
}
