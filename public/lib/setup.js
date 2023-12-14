function getMockups() {
    return new Promise((resolve, reject) => {
      const url = `${location}lib/mockups.json`;
      fetch(url).then(response => response.json()).then(json => {
          resolve(json);
      }).catch(error => {
          reject(error);
      });
  });
}

export { getMockups };