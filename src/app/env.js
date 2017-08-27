let ENV = {};

export const configureENV = config => {
  ENV = config;
};

export const getENV = () => (ENV);

export default getENV;
