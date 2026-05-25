const ejs = require("ejs");

const TEMPLATE = `
<div style="font-family:Arial,sans-serif;padding:24px;max-width:900px;margin:0 auto;line-height:1.5;">
  <h1 style="color:#1e90ff;">KnoUKno.net Business Print</h1>
  <p><strong>Business Title:</strong> <%= title %></p>
  <p><strong>Tier:</strong> <%= tier %></p>
  <h2 style="margin-top:20px;color:#111;">Questions and Answers</h2>
  <ol>
    <% items.forEach(function(item) { %>
      <li style="margin-bottom:14px;">
        <p><strong>Q:</strong> <%= item.question %></p>
        <p><strong>A:</strong> <%= item.answer %></p>
      </li>
    <% }) %>
  </ol>
</div>
`;

function renderPrintTemplate(payload) {
  return ejs.render(TEMPLATE, payload);
}

module.exports = { renderPrintTemplate };
