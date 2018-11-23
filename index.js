const fs = require("fs-promise");
const { getTags, buildImage, createDockerfiles } = require("./lib/utils");

(async function() {
  const name = "benjlevesque/node-puppeteer";
  await fs.ensureDir("generated");
  // const tags = await getTags("library/node");
  const tags = ["11-slim"];
  await createDockerfiles({
    image: "node",
    outDir: "generated",
    template: "Dockerfile.tpl",
    tags: tags
  });
  for (const tag of tags) {
    await buildImage({ tag, dockerfile: `generated/Dockerfile-${tag}`, name });
  }
})();
