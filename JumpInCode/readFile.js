

  let reader = new FileReader();

  reader.readAsText('index.html');

  reader.onload = function() {
    console.log(reader.result);
  };

  reader.onerror = function() {
    console.log(reader.error);
  };