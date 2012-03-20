$.ajax({
  url: "/add-entry",
  data: JSON.stringify({
    "token": "ZzP5jJSWknXiZ88Wl5gXJcRdK7KBWE",
    "firstName": "Luke",
    "lastName": "Karrys",
    "twitter": "lukekarrys",
    "gender": "male"
  }),
  type: 'POST',
  dataType: 'json',
  processData: false,
  contentType: 'application/json',
  success: function(d) {
    console.log(d);
  }
});