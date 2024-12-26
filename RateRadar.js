const http = require("http");
const fs = require("fs");

const server = http.createServer((req, res) => {
    const { method, url } = req;

    if (method === "GET") {
        if (url === "/") {
            // Serve the main HTML file
            fs.readFile("index.html", "utf8", (err, data) => {
                if (err) {
                    console.error("Error reading index.html:", err);
                    res.writeHead(500, { "Content-Type": "text/plain" });
                    res.end("Server Error");
                } else {
                    res.writeHead(200, { "Content-Type": "text/html" });
                    res.end(data);
                }
            });
        } else if (url === "/reviews") {
            // Serve the reviews JSON
            fs.readFile("reviews.json", "utf8", (err, data) => {
                if (err && err.code !== "ENOENT") {
                    console.error("Error reading reviews.json:", err);
                    res.writeHead(500, { "Content-Type": "text/plain" });
                    res.end("Server Error");
                } else {
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(data || "[]"); // Return empty array if no data
                }
            });
        } else {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("Not Found");
        }
    }
