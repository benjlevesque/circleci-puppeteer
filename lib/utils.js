const dockerfileTemplate = require("dockerfile-template");
const fs = require("fs-promise");
const fetch = require("node-fetch");
const util = require("util");
const child_process = require("child_process");
const exec = util.promisify(child_process.exec);

const getTags = async image => {
  const tags = [];
  let url = `https://hub.docker.com/v2/repositories/${image}/tags/`;
  while (url) {
    const response = await fetch(url);
    const data = await response.json();
    tags.push(...data.results.map(x => x.name));
    url = data.next;
  }
  return tags;
};

const createDockerfiles = async ({ image, template, outDir = ".", tags }) => {
  const dockerfile = await fs.readFile(template);
  if (typeof tags === typeof "") {
    tags = [tags];
  }
  for (const tag of tags) {
    const res = dockerfileTemplate.process(dockerfile.toString("utf8"), {
      BASE: image,
      TAG: tag
    });
    await fs.writeFile(`${outDir}/Dockerfile-${tag}`, res);
  }
};

const buildImage = async ({ tag, dockerfile, name }) => {
  console.log(`Build ${dockerfile}`);
  const { err, stderr } = await exec(
    `docker build -t ${name}:${tag} -f ${dockerfile} .`
  );
  if (err) {
    throw new Error(stderr);
  }
};

module.exports = {
  createDockerfiles,
  getTags,
  buildImage
};
