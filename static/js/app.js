
// Reset button declaration and event listener
var $reset_button=document.querySelector('#reset-btn');
$reset_button.addEventListener('click', Hard_Reset);


// Initiate on page startup
function init() {
  
  d3.json("/sport", function(error, data) {
    if (error) return console.warn(error);
    
    let selector = d3.select("#League_select");

    data.forEach((league) => {
    selector.append("option").text(`${league}`).property("value", league);

    
    });

// This will be utilized whenever a league is selected
function option_League(different_selection){
  d3.json("/nfl"), function(error, data){
    if (error) return console.warn(error);
    
    let selector = d3.select(".well")
    selector.append("h4").text("Select Team");
    data.forEach((league)=>{
    selector.append("select").property("id", "Team_select").property("onchange", "option_Team(this.value)");
    })
  }
}
init();