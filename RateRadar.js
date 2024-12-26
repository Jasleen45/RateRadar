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
    else if (method === "POST" && url === "/submit-review") {
        // Handle review submission
        let body = "";

        req.on("data", (chunk) => {
            body += chunk.toString();
        });

        req.on("end", () => {
            // Parse the form data manually
            const params = new URLSearchParams(body);

            const review = {
                name: params.get("name"),
                email: params.get("email"),
                type: params.get("type"),
                placeName: params.get("placeName"),
                placeAddress: params.get("placeAddress"),
                productName: params.get("productName"),
                productBrand: params.get("productBrand"),
                review: params.get("review")
            };

            // Read the current reviews
            fs.readFile("reviews.json", "utf8", (err, data) => {
                const reviews = data ? JSON.parse(data) : []; // Parse existing reviews or initialize empty array
                reviews.push(review); // Add the new review

                // Write the updated reviews back to the file
                fs.writeFile("reviews.json", JSON.stringify(reviews, null, 2), (err) => {
                    if (err) {
                        console.error("Error writing to reviews.json:", err);
                        res.writeHead(500, { "Content-Type": "text/plain" });
                        res.end("Server Error");
                        return;
                    }

                    console.log("Review added successfully:", review);
                    res.writeHead(302, { Location: "/" }); // Redirect back to home
                    res.end();
                });
            });
        });
    } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
    }
});

server.listen(3000, () => {
    console.log("Server is listening on http://localhost:3000");
});

