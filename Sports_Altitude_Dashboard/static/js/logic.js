
function markerBG(magnitude) {
  if (magnitude < 100) {
    return "rgb(0,0,255)";
  }
  else if (magnitude >= 100 && magnitude < 500) {
    return "rgb(0,157,0)";
  }
  else if (magnitude >= 500 && magnitude < 1000 ) {
    return "rgb(251, 255,0)";
  }
  else {
    return "rgb(255,0,0)";
  }
};


  var baseMaps = {};
  var overlayMaps_NHL= {};
  var overlayMaps_MLB= {};
  var mlb = [];
  var nhl = [];

  var mlb_markers=[];
  var nhl_markers=[];
  var nfl_markers=[];
  var nba_markers=[];

  var mlb_layergroup=[];

    var Init_map = L.map("map", {
    center: [38, -100],
    zoom: 4.4,
    //layers: [mlb, nhl]
  });


// Declares the legend variable
var legend = L.control({
  position: 'bottomright'
});
      
// Proper formatting so that legend displays properly
legend.onAdd = function () {
  var legend_div = L.DomUtil.create('div', 'Legend'),
    mag = [0, 100, 500, 1000];

legend_div.innerHTML += "<h5>Altitude (ft)</h5>";
        
  // Sets the color markers for each magnitude level
  for (let j = 0; j < mag.length; j++) {
    legend_div.innerHTML += '<j style="background:' + markerBG(mag[j] + 1) + '"></j>' + "&nbsp;"+mag[j] + (mag[j + 1] ? ' - ' + mag[j + 1] + '<br> ' :  '  +  ');
    }
    return legend_div;
  };
legend.addTo(Init_map);

    var tileLayer = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      // id: "mapbox.streets-basic",
      id: "mapbox.outdoors",
      accessToken: API_KEY
    }).addTo(Init_map);

    function init_bg () {
      Init_map.eachLayer(function (layer) {
        Init_map.removeLayer(layer)
      }); 
      L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoic2Jyb3duMTQ2IiwiYSI6ImNrMWUycThmajBhZzIzYm11bjRqMDRvamQifQ.M22-sX0fWx_QGYGZQpRDGw", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        // id: "mapbox.streets-basic",
        id: "mapbox.outdoors",
        // accessToken: API_KEY
      }).addTo(Init_map);
    }

    function init_keep () {
      Init_map.eachLayer(function (layer) {
        if (layer !== tileLayer) {
          Init_map.removeLayer(layer);
        }
      }); 
    }


function mlb_layer(){
  // let mlb_uri = `https://api.sportsdata.io/v3/mlb/scores/json/Stadiums?key=96bd58dc56684c418ee3b279caaf634e`;
  // let mlb_uri = `https://api.sportsdata.io/v3/mlb/scores/json/Stadiums?key=${API_KEY_MLB}`;
  d3.json(mlb_uri, function(data){

    let mlb_stadium=[];
    let mlb_stadium_ID=[];
    let mlb_city=[];
    let mlb_state=[];
    let mlb_lat=[]
    let mlb_long=[];
    let mlb_altitude=[];

    mlb_markers=[];

    // These are fixing indexing issues with the API.
    let mlb_index_lookup = [1, 8, 10, 13, 14, 18, 19, 21, 22, 23, 25, 27, 28, 29, 31, 33, 35, 41, 42, 44, 50, 51, 53, 54, 57, 62, 63, 64, 65, 68]; 
    
    let mlb_team_names=["San Diego Padres", "2", "3", "4", "5", "6", "7", "New York Mets", "9", "Cleveland Indians",  "11", "12", "San Francisco Giants", "Minnesota Twins",  "15", "16", "17", "Tampa Bay Rays", "Milwaukee Brewers",  "20", "Texas Rangers", "Baltimore Orioles", "Oakland Athletics",  "24", "Chicago White Sox",  "26", "Chicago Cubs", "Los Angeles Angels", "Pittsburgh Pirates",  "30", "Los Angeles Dodgers",  "32", "Kansas City Royals", "34", "New York Yankess",  "36", "37", "38", "39", "40", "St. Louis Cardinals", "Toronto Blue Jays",  "43", "Colorado Rockies", "45", "46", "47", "48", "49", "Boston Red Sox", "Philadelphia Phillies", "52", "Washington Nationals", "Arizona Diamondbacks", "55", "56", "Florida Marlins", "58", "59", "60", "61", "Detroit Tigers", "Houston Astros", "Cincinnati Reds", "Seattle Mariners", "66","67","Atlanta Braves"];

    for (let i = 0; i < data.length; i++){
        mlb_city.push(data[i].City);
        mlb_stadium.push(data[i].Name);
        mlb_stadium_ID.push(data[i].StadiumID);
        mlb_state.push(data[i].State);
        mlb_lat.push(data[i].GeoLat);
        mlb_long.push(data[i].GeoLong);
        mlb_altitude.push(data[i].Altitude);
    }

    for (let j of mlb_index_lookup) {
        let mlb_teams = [
          {
            name: mlb_team_names[j-1],
            stadium_name: mlb_stadium[j-1],
            state: mlb_state[j-1],
            location: [mlb_lat[j-1], mlb_long[j-1]],
            altitude: mlb_altitude[j-1]
          }
        ]
        
        for (let i = 0; i < mlb_teams.length; i++) {

          let color = "";
          if (mlb_teams[i].altitude < 100) {
            color = "blue";
          }
          else if (mlb_teams[i].altitude < 500) {
            color = "green";
          }
          else if (mlb_teams[i].altitude < 1000) {
            color = "yellow";
          }
          else {
            color = "red";
          }
        
          mlb_markers.push(L.circle(mlb_teams[i].location, {
            fillOpacity: 0.6,
            color: "white",
            fillColor: color,
            radius: mlb_teams[i].altitude * 100
          }).bindPopup("<h3>" + mlb_teams[i].name + "</h13 <h4> MLB: " + mlb_teams[i].stadium_name + "</h4> <hr> <h5>Altitude: " + mlb_teams[i].altitude + "</h5>").addTo(Init_map));
        }
      }
      mlb_layergroup=L.layerGroup(mlb_markers);
  });
}

//This works if only clearing out one layer group.  Figure out loop for this.
function option_League(different_selection) {
  if (different_selection=="NHL") {
    init_keep();
    // mlb_markers=[];
    // Init_map.removeLayer(mlb_layergroup);
    // mlb_layergroup.eachLayer(function(layer) { mlb_layergroup.removeLayer(layer);});
    // nba_markers=[];
    // Init_map.removeLayer(nba_markers);
    // nfl_markers=[];
    // Init_map.removeLayer(nfl_markers);
    //init_bg();
    // let nhl_uri = "https://api.sportsdata.io/v3/nhl/scores/json/Stadiums?key=58e0c90ff51242fba96ca913e355a656";
    // let nhl_uri = `https://api.sportsdata.io/v3/nhl/scores/json/Stadiums?key=${API_KEY_NHL}`;
    console.log(nhl_uri);
    d3.json(nhl_uri, function(data){

      let nhl_stadium=[];
      let nhl_city=[];
      let nhl_state=[];
      let nhl_lat=[]
      let nhl_long=[];

      nhl_markers=[];

      let nhl_team_names=["Anaheim Ducks", "Arizona Coyotes", "Boston Bruins", "Buffalo Sabres", "Carolina Hurricanes", "Columbus Blue Jackets", "Calgary Flames", "Chicago Blackhawks", "Colorado Avalanche", "Dallas Stars", "Detroit Red Wings", "Edmonton Oilers", "Florida Panthers", "Los Angeles Kings", "Minnesota Wild", "Montreal Canadians", "Nashville Predators", "New Jersey Devils", "New York Islanders", "New York Rangers", "Ottawa Senators", "Philadelphia Flyers", "Pittsburgh Penguins", "San Jose Sharks", "St. Louis Blues", "Tampa Bay Lightning", "Toronto Maple Leafs", "Vancouver Canucks", "Washington Capitals", "Winnipeg Jets"];

      let nhl_altitude=[163, 1071, 10, 580, 431, 736, 3425, 593, 5191, 426, 580, 2189, 17, 239, 790, 97, 447, 34, 35, 46, 323, 18, 808, 87, 473, 14, 260, 23, 46, 762];

      for (let i = 0; i < data.length; i++){
        nhl_city.push(data[i].City);
        nhl_stadium.push(data[i].Name);
        nhl_state.push(data[i].State);
        nhl_lat.push(data[i].GeoLat);
        nhl_long.push(data[i].GeoLong);
      }

      for (let j = 0; j < 30; j++) {
          let nhl_teams = [
            {
              name: nhl_team_names[j],
              stadium_name: nhl_stadium[j],
              state: nhl_state[j],
              location: [nhl_lat[j], nhl_long[j]],
              altitude: nhl_altitude[j]
            }
          ]
        
        for (let i = 0; i < nhl_teams.length; i++) {

          let color = "";
          if (nhl_teams[i].altitude < 100) {
            color = "blue";
          }
          else if (nhl_teams[i].altitude < 500) {
            color = "green";
          }
          else if (nhl_teams[i].altitude < 1000) {
            color = "yellow";
          }
          else {
            color = "red";
          }
        
          nhl_markers.push(L.circle(nhl_teams[i].location, {
            fillOpacity: 0.6,
            color: "white",
            fillColor: color,
            radius: nhl_teams[i].altitude * 100
          }).bindPopup("<h3>" + nhl_teams[i].name + "</h3> <h4> NHL: " + nhl_teams[i].stadium_name + "</h4> <hr> <h5>Altitude: " + nhl_teams[i].altitude + "</h5>").addTo(Init_map));
        }
      }
  });
  }
  else if (different_selection=="NFL"){
    init_keep();
    // let nfl_uri = "https://api.sportsdata.io/v3/nfl/scores/json/Stadiums?key=69f17d50cebe453f802706181a4d33b0";
    d3.json(nfl_uri, function(data){
  
      let nfl_stadium=[];
      let nfl_city=[];
      let nfl_state=[];
      let nfl_lat=[]
      let nfl_long=[];
  
      nfl_markers=[];
  
      let nfl_team_names=["Buffalo Bills", "Miami Dolphins", "New York Jets/Giants", "New England Patriots", "Cincinnati Bengals", "Cleveland Browns", "Baltimore Ravens", "Pittsburgh Steelers", "Indianapolis Colts", "Jacksonville Jaguars", "Houston Texans", "Tennessee Titans", "Denver Broncos", "San Diego Chargers", "Kansas City Chiefs", "Oakland Raiders", "Dallas Cowboys", "Philadelphia Eagles", "Washington Redskins", "Chicago Bears", "Detroit Lions", "Green Bay Packers", "Minnesota Vikings", "Tampa Bay Buccaneers", "Atlanta Falcons", "Carolina Panthers", "New Orleans Saints", "San Francisco 49ers", "Arizona Cardinals", "St. Louis Rams", "Seattle Seahawks"];
  
      let nfl_altitude=[866, 10, 7, 289, 482, 580, 10, 712, 715, 16, 49, 597, 5280, 52, 889, 43, 604, 39, 207, 590, 600, 640, 849, 52, 997, 751, 3, 26, 1070, 466, 16];
  
      for (let i = 0; i < data.length; i++){
        nfl_city.push(data[i].City);
        nfl_stadium.push(data[i].Name);
        nfl_state.push(data[i].State);
        nfl_lat.push(data[i].GeoLat);
        nfl_long.push(data[i].GeoLong);
      }
  
      for (let j = 0; j < 31; j++) {
          let nfl_teams = [
            {
              name: nfl_team_names[j],
              stadium_name: nfl_stadium[j],
              state: nfl_state[j],
              location: [nfl_lat[j], nfl_long[j]],
              altitude: nfl_altitude[j]
            }
          ]
          
          for (let i = 0; i < nfl_teams.length; i++) {
  
            let color = "";
            if (nfl_teams[i].altitude < 100) {
              color = "blue";
            }
            else if (nfl_teams[i].altitude < 500) {
              color = "green";
            }
            else if (nfl_teams[i].altitude < 1000) {
              color = "yellow";
            }
            else {
              color = "red";
            }
          
            nfl_markers.push(L.circle(nfl_teams[i].location, {
              fillOpacity: 0.6,
              color: "white",
              fillColor: color,
              radius: nfl_teams[i].altitude * 100
            }).bindPopup("<h3>" + nfl_teams[i].name + "</h3> <h4> NFL: " + nfl_teams[i].stadium_name + "</h4> <hr> <h5>Altitude: " + nfl_teams[i].altitude + "</h5>").addTo(Init_map));
          }
        }
    });
  }
  else if (different_selection=="NBA"){
    init_keep();
    // nba_uri = "https://api.sportsdata.io/v3/nba/scores/json/Stadiums?key=347c7cf39a8b4f58906ce63f2ac52906";
    d3.json(nba_uri, function(data){
  
      let nba_stadium=[];
      let nba_city=[];
      let nba_state=[];
      let nba_lat=[]
      let nba_long=[];
  
      nba_markers=[];
  
      let nba_team_names=["Washington Wizards", "Charlotte Hornets", "Atlanta Hawks", "Miami Heat", "Orlando Magic", "New York Knicks", "Philadelphia 76ers", "Brooklyn Nets", "Boston Celtics", "Toronto Raptors", "Chicago Bulls", "Cleveland Cavaliers", "Indiana Pacers", "Detroit Pistons", "Milwaukee Bucks", "Minnesota Timberwolves", "Utah Jazz", "Oklahoma City Thunder", "Portland TrailBlazers", "Denver Nuggets", "Memphis Grizzlies", "Houston Rockets", "New Orleans Pelicans", "San Antonio Spurs", "Dallas Mavericks", "Golden State Warriors", "Los Angeles Lakers/Clippers", "Phoenix Sun", "Sacramento Kings"];
  
      let nba_altitude=[30, 750, 1000, 5, 60, 25, 10, 30, 5, 20, 600, 700, 750, 950, 600, 800, 4200, 1200, 60, 5300, 250, 30, 5, 650, 500, 10, 250, 1100, 25];
  
      for (let i = 0; i < data.length; i++){
        nba_city.push(data[i].City);
        nba_stadium.push(data[i].Name);
        nba_state.push(data[i].State);
        nba_lat.push(data[i].GeoLat);
        nba_long.push(data[i].GeoLong);
      }
  
      for (let j = 0; j < 30; j++) {
          let nba_teams = [
            {
              name: nba_team_names[j],
              stadium_name: nba_stadium[j],
              state: nba_state[j],
              location: [nba_lat[j], nba_long[j]],
              altitude: nba_altitude[j]
            }
          ]
          
          for (let i = 0; i < nba_teams.length; i++) {
  
            let color = "";
            if (nba_teams[i].altitude < 100) {
              color = "blue";
            }
            else if (nba_teams[i].altitude < 500) {
              color = "green";
            }
            else if (nba_teams[i].altitude < 1000) {
              color = "yellow";
            }
            else {
              color = "red";
            }
          
            nba_markers.push(L.circle(nba_teams[i].location, {
              fillOpacity: 0.6,
              color: "white",
              fillColor: color,
              radius: nba_teams[i].altitude * 100
            }).bindPopup("<h3>" + nba_teams[i].name + "</h3> <h4> NBA: " + nba_teams[i].stadium_name + "</h4> <hr> <h5>Altitude: " + nba_teams[i].altitude + "</h5>").addTo(Init_map));
          }
        }
    });
  }
  else {
    init_keep();
    mlb_layer();
  }
}



mlb_layer();
