const { makeHtmlAttributes } = require('@rollup/plugin-html');

function formatToRollupPluginHtml(opts, htmlTemplate) {
  const { attributes, files, meta, publicPath, title } = opts;

  htmlTemplate = htmlTemplate.replace("${attributes}", makeHtmlAttributes(attributes.html));

  const metas = meta
    .map((input) => {
      const attrs = makeHtmlAttributes(input);
      return `<meta${attrs}>`;
    })
    .join('\n');

  htmlTemplate = htmlTemplate.replace("${metas}", metas);

  htmlTemplate = htmlTemplate.replace("${title}", title);

  const links = (files.css || [])
    .map(({ fileName }) => {
      const attrs = makeHtmlAttributes(attributes.link);
      return `<link href="${publicPath}${fileName}" rel="stylesheet"${attrs}>`;
    })
    .join('\n');

  htmlTemplate = htmlTemplate.replace("${links}", links);

  const scripts = (files.js || [])
    .map(({ fileName }) => {
      const attrs = makeHtmlAttributes(attributes.script);
      return `<script src="${publicPath}${fileName}"${attrs} defer></script>`;
    })
    .join('\n');

  htmlTemplate = htmlTemplate.replace("${scripts}", scripts);

  return htmlTemplate;
}

module.exports.formatToRollupPluginHtml = formatToRollupPluginHtml;
