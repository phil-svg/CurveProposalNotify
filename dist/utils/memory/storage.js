import fs from "fs";
const FILE_PATH = "../notified_ids.json";
export function getNotifiedIds() {
    if (!fs.existsSync(FILE_PATH)) {
        return [];
    }
    const data = fs.readFileSync(FILE_PATH, "utf-8");
    return JSON.parse(data);
}
export function storeNotifiedId(id) {
    const ids = getNotifiedIds();
    ids.push(id);
    fs.writeFileSync(FILE_PATH, JSON.stringify(ids));
}
//# sourceMappingURL=storage.js.map