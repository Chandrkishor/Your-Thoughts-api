const express = require("express");
const v1UserRoute = require("./v1/routes/userDetails");

const app = express();
const PORT = process.env.PORT || 5000;

app.use("/api/v1/userDetails", v1UserRoute);

app.listen(PORT, () => {
  console.log(`API is listening on port ${PORT}`);
});
