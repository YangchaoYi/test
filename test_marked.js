import fetch from 'node-fetch';
import { marked } from 'marked';

const importUrl = {
  extensions: [{
    name: 'importUrl',
    level: 'block',
    start(src) { return src.indexOf('\n:'); },
    tokenizer(src) {
      const rule = /^:(https?:\/\/.+?):/;
      const match = rule.exec(src);
      if (match) {
        return {
          type: 'importUrl',
          raw: match[0],
          url: match[1],
          html: '' // will be replaced in walkTokens
        };
      }
    },
    renderer(token) {
      return token.html;
    }
  }],
  async: true, // needed to tell marked to return a promise
  async walkTokens(token) {
    if (token.type === 'importUrl') {
      const res = await fetch(token.url);
      token.html = await res.text();
    }
  }
};

const plantumlBlock = {
  extensions: [{
    name: 'plantumlBlock',
    level: 'block',
    start(src) { return src.indexOf('@startuml'); },
    end(src) { return src.indexOf('@enduml'); },
    tokenizer(src) {
      const rule = /^@startuml([\S\s]*?)@enduml/;
      const match = rule.exec(src);
      if (match) {
        console.log("src")
        console.log(src)
        console.log("end src")
        console.log("match")
        console.log(match)
        console.log("end match")
        return {
          type: 'plantumlBlock',
          raw: match[0],
          url: match[1],
          html: '' // will be replaced in walkTokens
        };
      }
    },
    renderer(token) {
      if (token.type === 'plantumlBlock') {
        return token.html;
      }
    }
  }],
  async: true, // needed to tell marked to return a promise
  async walkTokens(token) {
    if (token.type === 'plantumlBlock') {
      token.html = "ycyiplantuml";
    }
  }
};

// marked.use(importUrl);
marked.use(plantumlBlock);

const markdown = `
# example.com

:https://example.com:

first paragraph:
@startuml

A -> B

@enduml

second paragraph:
@startuml

C -> D

@enduml
`;

const html = await marked.parse(markdown);

console.log(html);
