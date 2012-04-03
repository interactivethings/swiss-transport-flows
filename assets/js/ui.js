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
  $('#focus_toggle label').tipsy({
    gravity: 'n',
    html: true,
    title: function() {
      var d = "Show "+$(this).html();
      return d;
    }
  });
  $( "#focus_toggle" ).buttonset();
});
