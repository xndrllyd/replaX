var htmlData, txt = [];
var current_fs, next_fs, previous_fs;
var left, opacity, scale, animating;
var uploadcsv = false;

var editor = CodeMirror(document.getElementById("result"), {
  mode: 'text/html',
  tabMode: 'indent',
  lineNumbers: true,
  theme: 'ambiance',
  readOnly: true,
  autoClearEmptyLines: true
});

$("#uploadcsv").change(function(e) {
  if (e.target.files != undefined) {
    var file = e.target.files[0],
        reader = new FileReader();

    $(this).siblings('.run').removeAttr('disabled');

    reader.readAsText(file);

    reader.onload = function(e) {
      var csvData = e.target.result.split(',\n');

      for (var i = 0; i < txt.length; i++) {
        htmlData = htmlData.replace(txt[i], csvData[i]);
      };
    };

    reader.onerror = function() {
      alert('Unable to read ' + file.fileName);
    };
  };

  return false;
});

$("#uploadhtml").change(function(e) {
  if (e.target.files != undefined) {
    var file = e.target.files[0],
        reader = new FileReader();

    $(this).siblings('.next').removeAttr('disabled');

    reader.readAsText(file);

    reader.onload = function(e) {
      var elms = $(e.target.result).find('*');
      
      htmlData = e.target.result;

      elms.contents().filter(function() {  
        if (this.nodeType === 3) {
          txt.push(this.nodeValue);

          txt = $.grep(txt, function(v, i) {
            return txt[i] = $.trim(v);
          });
        };
      });
    };

    reader.onerror = function() {
      alert('Unable to read ' + file.fileName);
    };
  };

  return false;
});

$(".next").click(function() {
  if (animating) {
    return false;
  };
  
  animating = true;
  
  current_fs = $(this).parent();
  next_fs = $(this).parent().next();

  if ($(this).attr('name') == 'upload') {
    uploadcsv = true;
  } else if ($(this).attr('name') == 'create') {
    uploadcsv = false;
  };

  if (current_fs.hasClass('fs-step-2') && uploadcsv == true) {
    next_fs = $(this).parent().next().next();
  };
  
  $("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");
  
  if (uploadcsv == true) {
    $("#progressbar").css('transform', 'rotateY(360deg)');
    
    setTimeout(function() {
      $("#progressbar li.downloadcsv").hide();
      $("#progressbar li").width('25%');
    }, 400);
  } else {
    $("#progressbar").css('transform', 'rotateY(0deg)');
    setTimeout(function() {
      $("#progressbar li").width('20%');
      $("#progressbar li.downloadcsv").show();
    }, 400);
  };

  next_fs.show();

  current_fs.animate({opacity: 0}, {
    step: function(now, mx) {
      scale = 1 - (1 - now) * 0.2;
      left = (now * 50) + "%";
      opacity = 1 - now;
      current_fs.css('transform', 'scale(' + scale + ')');
      next_fs.css({
        'left': left,
        'opacity': opacity
      });
    },

    duration: 800,

    complete: function() {
      current_fs.hide();
      animating = false;
    },

    easing: 'easeInOutBack'
  });
});

$(".previous").click(function() {
  if (animating) {
    return false;
  };

  animating = true;
  
  current_fs = $(this).parent();
  previous_fs = $(this).parent().prev();

  if (current_fs.hasClass('fs-step-4') && uploadcsv == true) {
    previous_fs = $(this).parent().prev().prev();
  };
  
  $("#progressbar li").eq($("fieldset").index(current_fs)).removeClass("active");

  previous_fs.show(); 

  current_fs.animate({opacity: 0}, {
    step: function(now, mx) {
      scale = 0.8 + (1 - now) * 0.2;
      left = ((1 - now) * 50) + "%";
      opacity = 1 - now;
      current_fs.css('left', left);
      previous_fs.css({
        'transform': 'scale(' + scale + ')',
        'opacity': opacity
      });
    },

    duration: 800,

    complete: function() {
      current_fs.hide();
      animating = false;
    },

    easing: 'easeInOutBack'
  });
});

$(".download").click(function() {
  if ($(this).parent().hasClass('fs-step-3')) {
    var tmp = [];
  
    this.href = "data:text/csv;charset=UTF-8,"  + encodeURIComponent(txt.join(',\n'));
    
    $(this).siblings('.next').removeAttr('disabled');
  } else {
    this.href = "data:text/plain;charset=UTF-8,"  + encodeURIComponent(editor.getValue().trim());
  };
});

$(".run").click(function() {
  editor.setValue(htmlData);
  editor.autoFormatRange({line:0, ch:0}, {line:editor.lineCount()-1, ch:0});
  editor.execCommand("selectAll");
  editor.focus();
});