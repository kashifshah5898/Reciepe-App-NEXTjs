import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data/recipes.json");

export default function handler(req, res) {
  const { method } = req;

  switch (method) {
    case "GET":
      res.status(200).json({ data: getRecipes(req.query, req.body) });
      break;

    case "POST":
      res.status(200).json({ data: addRecipe(req.query, req.body) });
      break;

    case "PUT":
      res.status(200).json({ data: updateRecipe(req.query, req.body) });
      break;

    case "DELETE":
      res.status(200).json({ data: deleteRecipe(req.query, req.body) });
      break;

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).end("Method not allowed");
      break;
  }
}

function getRecipes(query, body) {
  const { id, region } = query;
  let data = fs.readFileSync(filePath, "utf-8");
  data = JSON.parse(data);

  if (id) {
    let dataWithId;
    for (let index = 0; index < data.length; index++) {
      if (data[index].id == id) {
        dataWithId = data[index];
      }
    }
    return dataWithId;
  }

  if (region) {
    let dataWithRegion = [];
    for (let index = 0; index < data.length; index++) {
      if (data[index].region == region) {
        dataWithRegion.push(data[index]);
      }
    }
    return dataWithRegion;
  }

  return data;
}

function addRecipe(query, body) {
  const { name, region, instructions, image, ingredients } = body;
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const newRecord = {
    id: data.length + 1,
    name: name,
    region: region,
    instructions: instructions,
    image: image,
    ingredients: ingredients,
  };
  data.push(newRecord);
  fs.writeFileSync(filePath, JSON.stringify(data));
  return newRecord;
}

function updateRecipe(query, body) {
  const { id } = query;
  const { name, region, instructions, image, ingredients } = body;
  let dataWithId;
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  for (let index = 0; index < data.length; index++) {
    if (data[index].id == id) {
      dataWithId = index;
    }
  }

  if (dataWithId === -1) {
    return json({ message: "Record not found" });
  }

  const updatedRecord = {
    ...data[dataWithId],
    name: name,
    region: region,
    instructions: instructions,
    image: image,
    ingredients: ingredients,
  };
  data[dataWithId] = updatedRecord;

  fs.writeFileSync(filePath, JSON.stringify(data));

  return updatedRecord;
}

function deleteRecipe(query, body) {
  const id = parseInt(query.id);
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  let index;
  for (let i = 0; i < data.length; i++) {
    if (data[i].id == id) {
      index = i;
    }
  }
  data.splice(index, 1);
  fs.writeFileSync(filePath, JSON.stringify(data));

  return { message: "Record deleted" };
}
