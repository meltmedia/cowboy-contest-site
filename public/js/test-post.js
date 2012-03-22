$(document).ready(
  function() {

    var $test = $("#test"),
    entryUri = '/add-entry',
    token = 'ZzP5jJSWknXiZ88Wl5gXJcRdK7KBWE';

    var callback = function(event) {
      event.preventDefault();

              console.log('hi');

        var serializedData = $test.serializeArray(),
            i=0, data = {};

        for(i;i<serializedData.length;i++) {
          var d = serializedData[i];

          data[d.name] = d.value;
        }

        data.token = token;

        $.ajax({
          url: entryUri,
          data: JSON.stringify(data),
          type: 'POST',
          dataType: 'json',
          processData: false,
          contentType: 'application/json',
          success: function(d) {
            entryUri = entryUri + '/' + d.entryId;

            $test.action = entryUri;

            $test.unbind('submit', callback);
            $test.submit(
              function(event) {
                event.preventDefault();
                var file = $('input[name="image"]')[0].files[0];
                $.ajax({
                  url: entryUri,
                  data: file,
                  type: 'POST',
                  processData: false,
                  contentType: 'application/octet-stream',
                  headers: {'X-File-Name': file.fileName},
                  progress: function() {
                    console.log('progress');
                  },
                  success: function() {
                    console.log('done');
                  }

                });
              });
            $test.submit();
          }
        });
    };

    $test.submit(callback);

  });