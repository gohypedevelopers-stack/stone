fetch('http://localhost:5000/api/admin/products')
  .then(res => res.json())
  .then(data => {
      console.log(JSON.stringify(data.data.map(p => p.imageUrls), null, 2));
  });
