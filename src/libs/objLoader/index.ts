import { getContentFromUrls } from '../xhr/index';

type NetworkError = {
  status: number,
  url?: string
};

type materialType = {
  Ka: Float32Array,
  Kd: Float32Array,
  Ks: Float32Array,
  Ni: number,
  Ns: number,
  d: number,
  illum: number,
  index: number,
  map_Kd: undefined,
  name: string,
  textureMap: undefined
};

export function loadObjFile(objFileUrl: string, materialFilesUrls: string[], cb: (err: NetworkError | null, model: any) => void): void {
  const allUrl = [ objFileUrl ].concat(materialFilesUrls);
  getContentFromUrls(allUrl, (err, texts) => {
    if (err) {
      cb(err, texts);
      return;
    }

    const verticesCompressed: Float32Array[] = [];
    let currentGeometry: "triangles" | "lines" | "points";
    let currentMaterialName = "";

    const model: any = {
      name: "",
      triangles: {
        verticesCompressed: [],
        vertices: null,
        colors: null,
        materialName: ""
      },
      materials: {},
      faces: [],
    };

    for (let i = texts.length - 1; i >= 1; i--) {
      const currentMaterialText = texts[i];
      const materials = getMaterialsFromText(currentMaterialText);

      materials.forEach(material => {
        model.materials[material.name] = material;
      });
    }

    const lines = texts[0].split("\n");

    for (let i = 0; i < lines.length; i++) {
      const lineString = lines[i].trim().replace(/\s+/g, " ");
      const words = lineString.split(" ");

      switch(words[0]) {
        case "#":
        case "mtllib":
          break;
        case "usemtl":
          currentMaterialName = words[1];
          break;
        case "o":
          model.name = words[1];
          break;
        case "v":
          verticesCompressed.push(new Float32Array(
            [ parseFloat(words[1]), parseFloat(words[2]), parseFloat(words[3]) ]
          ));
          break;
        case "f":
          currentGeometry = "triangles";

          if (model[currentGeometry].materialName == "") {
            model[currentGeometry].materialName = currentMaterialName;
          }

          // Each group of 3 values after f means you have a triangle
          // so if you have "f 1 2 3 4" you have 2 triangles (1 2 3, 1 3 4)
          for (let j = 1; j < words.length - 2; j++) {
            model[currentGeometry].verticesCompressed.push(Number(words[1]) - 1) // 1 based to 0 based
            model[currentGeometry].verticesCompressed.push(Number(words[j + 1]) - 1) // 1 based to 0 based
            model[currentGeometry].verticesCompressed.push(Number(words[j + 2]) - 1) // 1 based to 0 based
          }
          break;
      }
    }

    const triangles = model.triangles
    triangles.vertices = new Float32Array(triangles.verticesCompressed.length * 3);
    triangles.colors = new Float32Array(triangles.verticesCompressed.length * 3);

    triangles.verticesCompressed.forEach((vertexIndex: number, index: number) => {
      const multIndex = index * 3;
      triangles.vertices[multIndex + 0] = verticesCompressed[vertexIndex][0];
      triangles.vertices[multIndex + 1] = verticesCompressed[vertexIndex][1];
      triangles.vertices[multIndex + 2] = verticesCompressed[vertexIndex][2];

      const currentColor = model.materials[triangles.materialName].Kd;

      triangles.colors[multIndex + 0] = currentColor[0];
      triangles.colors[multIndex + 1] = currentColor[1];
      triangles.colors[multIndex + 2] = currentColor[2];
    });

    cb(null, model);
  });
}

function getMaterialsFromText(text: string): materialType[] {
  const lines = text.split("\n");

  const materials: materialType[] = [];
  let currentMaterial: materialType = {} as materialType;

  for (let i = 0; i < lines.length; i++) {
    const lineString = lines[i].trim().replace(/\s+/g, " ");
    const words = lineString.split(" ");

    switch(words[0]) {
      case "#":
      case "":
        break;

      case "newmtl":
        currentMaterial = {} as materialType;
        materials.push(currentMaterial);
        currentMaterial.name = words[1];
        break;

      case "Ka":
      case "Kd":
      case "Ks":
        currentMaterial[words[0]] = new Float32Array([
            parseFloat(words[1]),
            parseFloat(words[2]),
            parseFloat(words[3]),
            words[4] != null ? parseFloat(words[4]) : 1.0
        ]);
        break;

      case "Ns":
      case "Ni":
      case "d":
        currentMaterial[words[0]] = parseFloat(words[1]);
        break;

      case "illum":
        currentMaterial[words[0]] = parseInt(words[1]);
        break;
    }
  }

  return materials;
}
