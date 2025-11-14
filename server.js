import express from "express";
import cors from "cors";
import fs from "fs/promises";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.resolve("./data/schedule.json");

async function readData() {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    return { tutoring: [], groups: [] };
  }
}

async function writeData(data) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

// Serve static site files from project root
app.use(express.static(path.resolve(".")));

app.get("/api/sessions", async (req, res) => {
  const data = await readData();
  res.json(data);
});

app.post("/api/reserve", async (req, res) => {
  const { id, name } = req.body;
  if (!id || !name)
    return res.status(400).json({ error: "id and name required" });
  const data = await readData();
  const item = data.tutoring.find((s) => s.id === id);
  if (!item) return res.status(404).json({ error: "not found" });
  if (item.seats <= 0) return res.status(400).json({ error: "no seats" });
  item.seats -= 1;
  await writeData(data);
  res.json({ success: true, item });
});

app.post("/api/join", async (req, res) => {
  const { id, name } = req.body;
  if (!id || !name)
    return res.status(400).json({ error: "id and name required" });
  const data = await readData();
  const item = data.groups.find((s) => s.id === id);
  if (!item) return res.status(404).json({ error: "not found" });
  if (item.spots <= 0) return res.status(400).json({ error: "no spots" });
  item.spots -= 1;
  await writeData(data);
  res.json({ success: true, item });
});

app.post("/api/events", async (req, res) => {
  const { type, event } = req.body;
  if (!type || !event)
    return res.status(400).json({ error: "type and event required" });
  const data = await readData();
  if (type === "tutoring") {
    event.id = (data.tutoring.reduce((m, e) => Math.max(m, e.id), 0) || 0) + 1;
    data.tutoring.push(event);
  } else if (type === "group") {
    event.id =
      (data.groups.reduce((m, e) => Math.max(m, e.id), 100) || 100) + 1;
    data.groups.push(event);
  } else {
    return res.status(400).json({ error: "unknown type" });
  }
  await writeData(data);
  res.json({ success: true, event });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
