// Compañías con las que trabaja David: logos de la landing y fichas de /companias.
export type Company = {
  slug: string;
  name: string;
  logo: string;
  // Achica el logo dentro de su recuadro si a simple vista queda más grande que los demás
  logoScale?: number;
  origin: string;
  founded: string;
  text: string;
  // Compañías que gestionamos a través de otra (slug de la compañía por la que llegamos)
  via?: string;
};

export const COMPANIES: Company[] = [
  {
    slug: "mapfre",
    name: "Mapfre",
    logo: "/aseguradoras/mapfre.png",
    origin: "Madrid, España",
    founded: "Fundada en 1933 · en Argentina desde 1986",
    text:
      "Nació en Madrid como una mutual de productores agropecuarios para cubrir los accidentes de trabajo en el campo. Hoy es la aseguradora española más grande del mundo y una de las principales de América Latina. En Argentina trabaja desde 1986.",
  },
  {
    slug: "swiss-medical",
    name: "Swiss Medical",
    logo: "/aseguradoras/swiss-medical.png",
    logoScale: 0.8,
    origin: "Buenos Aires, Argentina",
    founded: "Grupo Swiss Medical desde 1989",
    text:
      "Forma parte del Grupo Swiss Medical, que empezó en 1989 con la construcción de la Clínica y Maternidad Suizo Argentina y hoy reúne clínicas, medicina prepaga y seguros. Entró al mercado asegurador al comprar St. Paul Argentina, de donde nació Swiss Medical Seguros.",
  },
  {
    slug: "mercantil-andina",
    name: "Mercantil Andina",
    logo: "/aseguradoras/mercantil-andina.png",
    origin: "Mendoza, Argentina",
    founded: "Fundada en 1923",
    text:
      "Compañía de capitales argentinos fundada en Mendoza en 1923, con más de 100 años de trayectoria. Desde Cuyo se expandió a todo el país y hoy cubre autos, hogar, comercio, campo y personas. En 2022 sumó su propia ART, Andina ART.",
  },
  {
    slug: "andina-art",
    name: "Andina ART",
    logo: "/aseguradoras/andina-art.png",
    origin: "Mendoza, Argentina",
    founded: "Opera desde 2022",
    text:
      "Es la aseguradora de riesgos del trabajo del grupo Mercantil Andina. Empezó a operar a fines de 2022, con la aprobación de la Superintendencia de Seguros y de la Superintendencia de Riesgos del Trabajo. Cubre a los trabajadores ante accidentes laborales y enfermedades profesionales, y asesora a los empleadores en prevención.",
  },
  {
    slug: "san-cristobal",
    name: "San Cristóbal Seguros",
    logo: "/aseguradoras/san-cristobal.png",
    origin: "Rosario, Santa Fe",
    founded: "Fundada en 1939",
    text:
      "Mutual de seguros generales nacida en Rosario: sus asegurados son también sus socios. Encabeza el Grupo San Cristóbal, que integra entre otras a Asociart ART, y es una de las compañías más elegidas para autos, hogar, comercio y campo.",
  },
  {
    slug: "asociart",
    name: "Asociart ART",
    logo: "/aseguradoras/asociart.png",
    origin: "Buenos Aires, Argentina",
    founded: "Fundada en 1996",
    text:
      "Es la ART del Grupo San Cristóbal. Nació en 1996, junto con el sistema de riesgos del trabajo en Argentina, y en 2026 cumple 30 años. Cubre a más de un millón de trabajadores en todo el país.",
  },
  {
    slug: "segurometal",
    name: "Segurometal",
    logo: "/aseguradoras/segurometal.png",
    origin: "Rosario, Santa Fe",
    founded: "Fundada en 1959",
    text:
      "Cooperativa de seguros fundada en Rosario el 22 de mayo de 1959 por empresarios metalúrgicos de la región, para proteger sus fábricas, importaciones y exportaciones. En 1964 sumó los seguros de autos y camiones y adoptó su nombre actual.",
  },
  // Asistencia al viajero: convenios de Mercantil Andina (Mercantil Andina | Masturismo)
  {
    slug: "universal-assistance",
    name: "Universal Assistance",
    logo: "/aseguradoras/universal-assistance.png",
    origin: "Buenos Aires, Argentina",
    founded: "Grupo Zurich desde 2018",
    via: "mercantil-andina",
    text:
      "Una de las empresas líderes de asistencia al viajero en Argentina, hoy parte del grupo Zurich. Tiene planes con distintos niveles de cobertura para adaptarse a cada viaje y a cada presupuesto, y una amplia red de prestadores en todo el mundo para recibir atención médica de calidad estés donde estés.",
  },
  {
    slug: "europ-assistance",
    name: "Europ Assistance",
    logo: "/aseguradoras/europ-assistance.png",
    origin: "París, Francia",
    founded: "Fundada en 1963 · Grupo Generali",
    via: "mercantil-andina",
    text:
      "Nació en París en 1963 como el primer servicio de asistencia para quienes viajaban al exterior, y hoy pertenece al grupo Generali. Brinda asistencia médica, de viaje, legal y de seguridad, con una red de prestadores en más de 200 países.",
  },
  {
    slug: "assist-card",
    name: "Assist Card",
    logo: "/aseguradoras/assist-card.png",
    origin: "Ginebra, Suiza",
    founded: "Fundada en 1972",
    via: "mercantil-andina",
    text:
      "Con más de 50 años de trayectoria, te cubre no solo en lo médico (urgencias odontológicas, esguinces, fracturas o malestares en general) sino también si se pierde el equipaje, si el vuelo se demora o se cancela, o si te roban o perdés los documentos.",
  },
];

export const INSURERS = COMPANIES.filter((c) => !c.via);
export const TRAVEL = COMPANIES.filter((c) => c.via === "mercantil-andina");
