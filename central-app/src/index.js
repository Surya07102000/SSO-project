const { port } = require('./config/config');
const app = require('./app');

app.listen(port, async () => {
  await app.initDb();
  console.log(`Server running at http://localhost:${port}`)
})