<<<<<<< HEAD
$(document).ready(function(){
    $("a#panel_toggle").click(function(){
        var panel = $("#panel");
        if (panel.attr("class") == "folded") {
            $(".section").not("#title").slideDown();
            $("#title").removeClass("last");
            panel.attr("class", "unfolded");
        }
        else {
            $(".section").not("#title").slideUp();
            $("#title").addClass("last");
            panel.attr("class", "folded");
        }
    });
});
=======
$(document).ready(function() {
  $("a#panel_toggle").click(function() {
    var panel = $("#panel");
    if(panel.attr("class") == "folded"){
      $(".section").not("#title").slideDown("normal", function(){
        $(".section").not("#title").children().animate({opacity: 1});
        $("#title").removeClass("last");
        panel.attr("class", "unfolded");
      });
    }else{
      $(".section").not("#title").children().animate({opacity: 0}, "normal", function(){
        $(".section").not("#title").slideUp();
        $("#title").addClass("last");
        panel.attr("class", "folded");
      });
    }
  });
});
>>>>>>> 1608523821af316fd2326a9b3367a31b36b25ab5
