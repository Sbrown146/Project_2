//Function Declarations
//Save stadium, geolat geolong separately to avoid api exhaustion.

// Global Declarations

// These store home win % against common opponents for each league
var NBA_array=[];
var MLB_array=[];
var NFL_array=[];
var NHL_array=[];

// These store altitude for each league
var NBA_altitude=[];
var MLB_altitude=[];
var NFL_altitude=[];
var NHL_altitude=[];
let Team_win_array=[];

// This is used as a dynamic variable for league correlation.  Basically, this is used so the correlation for each leagues altitude against home wins % vs. similar opponents displays correctly on the html table.
let league_set="NBA";


//Statitical functions

//Correlation function
const pcorr = (x, y) => {
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumX2 = 0,
    sumY2 = 0;
  const minLength = x.length = y.length = Math.min(x.length, y.length),
    reduce = (xi, idx) => {
      const yi = y[idx];
      sumX += xi;
      sumY += yi;
      sumXY += xi * yi;
      sumX2 += xi * xi;
      sumY2 += yi * yi;
    }
  x.forEach(reduce);
  return (minLength * sumXY - sumX * sumY) / Math.sqrt((minLength * sumX2 - sumX * sumX) * (minLength * sumY2 - sumY * sumY));
};
//Montecarlo simulator
function trial(p, n) {
  let mc_array=[];

  for (let i = 0; i < n; i++) {
      // if (Math.round(Math.random()) < .5){
      if ((p - Math.random()) > 0) {
          mc_array.push(p);
      }
      else {
          mc_array.push(1-p);
      }
  }
  return mc_array;
}
function monteCarlo(m, q, x) {
  let mc_m_array = [];
  let mc_m_win_pct = [];
  let array_mean = 0;
  let s=0;

  for (let i = 0; i < m; i++) {
      mc_m_array.push(trial(q, x));
  }
  for (let j = 0; j < m; j++) {
      mc_m_win_pct.push((mc_m_array[j].reduce((a,b) => a + b, 0))/x);
  }
  array_mean = (mc_m_win_pct.reduce((a,b) => a + b, 0)/m);
  s = Math.sqrt(mc_m_win_pct.map(x => Math.pow(x-array_mean,2)).reduce((a,b) => a+b)/m);
  
  let upper = array_mean + (1.96)*s;
  let lower = array_mean - (1.96)*s;

  return mc_results = {Results: mc_m_array, Mean_Array: mc_m_win_pct, Mean: array_mean, Std: s, Upper_95: upper, Lower_95: lower};
}


// These 3 functions that initialize on page load.

//Get the 4 league names and sets the nba functions into motion on page startup.
function init() {
  
  d3.json("/league", function(error, data) {
    if (error) return console.warn(error);
    
    let selector = d3.select("#League_select");

    // Get the four league names
    data.forEach((league) => {
    selector.append("option").text(league).property("value", league);
    })
  })
  // Initiate the following functions
  nba_graphs();
  nba_data();
  nba_maps();
};

//Get nba team names on page startup
function nba_data() {
  d3.json("/nba", function(error, data) {
    if (error) return console.warn(error);

    let selector = d3.select("#Team_select");

    // Clears than sets title for leaflet map
    d3.select("#map-header").html("");
    d3.select("#map-header").append("h3").text("Altitude for NBA Teams");
  
    // Adds nba team names to dropdown menu
    data.forEach((team) => {
    selector.append("option").text(team).property("value", team);
    })

    //Initiates init_team for the first team in list
    init_team(data[0]);
  })
};

//Get data for first name of team in the nba team list
function init_team(index_0) {
  d3.json("/league/"+index_0, function(error, data){
    d3.select(".panel-title").html("");
    d3.select("#option-data").html("");

    mlb_corr_init();
    nhl_corr_init();
    nfl_corr_init();
   
    // These calculate percentages for wins, home wins and home wins against similar opponents.
    // Every element is multiplied by 1 to make sure it is set as a numeric variable.
    let team_wins = [data.win_pct_1*1 + data.win_pct_2*1 + data.win_pct_3*1 + data.win_pct_4*1 + data.win_pct_5*1]/5;

    let team_home_wins = [data.home_win_pct_1*1 + data.home_win_pct_2*1 + data.home_win_pct_3*1 + data.home_win_pct_4*1 + data.home_win_pct_5*1]/5;

    let team_home_opp_wins = [data.similar_opp_home_1*1 + data.similar_opp_home_2*1 + data.similar_opp_home_3*1 + data.similar_opp_home_4*1 + data.similar_opp_home_5*1]/5;
    
    // Adds team data to the panels
    d3.select(".panel-title").text(`Stats for: ${data.team}`);
    d3.select("#option-data").append("h5").text(`League: ${data.league}`);
    d3.select("#option-data").append("h5").text(`Altitude: ${data.altitude} feet`);
    d3.select("#option-data").append("h5").text(`Win Pct: ${((team_wins)*100).toFixed(2)}%`);
    d3.select("#option-data").append("h5").text(`Home Win Pct: ${((team_home_wins)*100).toFixed(2)}%`);
    d3.select("#option-data").append("h5").text(`Home Win Pct vs Similar Opponents: ${((team_home_opp_wins)*100).toFixed(2)}%`);
    
    // This is where the league_set variable is used as the correlation variable displays for the correct league.
    if (league_set=="NBA") {
      d3.select("#option-data").append("h5").text(`Correlation for Home Win Pct vs Similar Opponent and Altitude: ${(pcorr(NBA_array, NBA_altitude)).toFixed(2)}`);
    }
    else if (league_set=="NFL") {
      d3.select("#option-data").append("h5").text(`Correlation for Home Win Pct vs Similar Opponent and Altitude: ${(pcorr(NFL_array, NFL_altitude)).toFixed(2)}`);
    }
    else if (league_set=="MLB") {
      d3.select("#option-data").append("h5").text(`Correlation for Home Win Pct vs Similar Opponent and Altitude: ${(pcorr(MLB_array, MLB_altitude)).toFixed(2)}`);
    }
    else {
      d3.select("#option-data").append("h5").text(`Correlation for Home Win Pct vs Similar Opponent and Altitude: ${(pcorr(NHL_array, NHL_altitude)).toFixed(2)}`);
    };

  })
};


//These functions fix an issue with the correlations for mlb, nfl and nhl not showing up properly
function mlb_corr_init() {
  d3.json("/mlb_data", function(error, data){
    if (error) return console.warn(error);
    
    MLB_array=[];
    MLB_altitude=[];

    for (let i = 0; i < data.altitude.length; i++){
      eval("var Team_win_array_mlb"+i+"=[data.similar_opp_home_1["+i+"]*1 + data.similar_opp_home_2["+i+"]*1 + data.similar_opp_home_3["+i+"]*1 + data.similar_opp_home_4["+i+"]*1 + data.similar_opp_home_5["+i+"]*1]/5");
      eval("Team_win_array.push(Team_win_array_mlb"+i+")");
      eval("MLB_array.push(Team_win_array_mlb"+i+")");
      eval("MLB_altitude.push(data.altitude["+i+"]*1)");
  };
  })
}

function nfl_corr_init() {
  d3.json("/nfl_data", function(error, data){
    if (error) return console.warn(error);

    NFL_array=[];
    NFL_altitude=[];

    for (let i = 0; i < data.altitude.length; i++){
        eval("var Team_win_array_nfl"+i+"=[data.similar_opp_home_1["+i+"]*1 + data.similar_opp_home_2["+i+"]*1 + data.similar_opp_home_3["+i+"]*1 + data.similar_opp_home_4["+i+"]*1 + data.similar_opp_home_5["+i+"]*1]/5");
        eval("Team_win_array.push(Team_win_array_nfl"+i+")");
        eval("NFL_array.push(Team_win_array_nfl"+i+")");
        eval("NFL_altitude.push(data.altitude["+i+"]*1)");
    }
})
}

function nhl_corr_init() {
  d3.json("/nhl_data", function(error, data){
    if (error) return console.warn(error);

    NHL_array=[];
    NHL_altitude=[];

    for (let i = 0; i < data.altitude.length; i++){
        eval("var Team_win_array_nhl"+i+"=[data.similar_opp_home_1["+i+"]*1 + data.similar_opp_home_2["+i+"]*1 + data.similar_opp_home_3["+i+"]*1 + data.similar_opp_home_4["+i+"]*1 + data.similar_opp_home_5["+i+"]*1]/5");
        eval("Team_win_array.push(Team_win_array_nhl"+i+")");
        eval("NHL_array.push(Team_win_array_nhl"+i+")");
        eval("NHL_altitude.push(data.altitude["+i+"]*1)");
    };
  })
}



// These 8 function produce the graphs and map data for each of the four leagues. 

//Sets graph for nba teams
function nba_graphs() {
  d3.json("/nba_data", function(error, data){
    if (error) return console.warn(error);

    // Plot data
    let Team_win_array=[];
    let mc_mean=[];
    let mc_std=[];
    NBA_array=[];
    NBA_altitude=[];

    //Home winning average for 5 seasons.  This is done as a test using dynamic variable naming to test how it utilizes system resources againsts making arrays for all available teams.
    for (let i = 0; i < data.altitude.length; i++){
        eval("var Team_win_array"+i+"=[data.similar_opp_home_1["+i+"]*1 + data.similar_opp_home_2["+i+"]*1 + data.similar_opp_home_3["+i+"]*1 + data.similar_opp_home_4["+i+"]*1 + data.similar_opp_home_5["+i+"]*1]/5");
        eval("Team_win_array.push(Team_win_array"+i+")");
        eval("var mc"+i+"=monteCarlo(10000, Team_win_array"+i+", 20)");
        eval("mc_mean.push(mc"+i+".Mean)");
        eval("mc_std.push(mc"+i+".Std*1.96)");
        eval("NBA_array.push(Team_win_array"+i+")");
        eval("NBA_altitude.push(data.altitude["+i+"]*1)");
    };
    

    // Error Plot

    let data_error = [
      {
        x: Team_win_array,
        y: data.team,
        mode: "markers",
        error_x: {
          type: 'data',
          symmetric: false,
          array: mc_std,
          arrayminus: mc_std
        },
        type: 'scatter'
      }
    ];

    let nba_box_layout = {
      showlegend: false,
      range: [0.4, 0.75],
      title: 'Simulated Home Win %',
      margin: {
        l: 140,
        r: 50,
        b: 50,
        t: 50
      },
      width: 450,
      height: 500,
      xaxis: {
        title: "Probably of Home Win vs Similar Opponent"
      },
      yaxis: {
        tickangle: 0,
        tickfont: {
          size: 10
        },
      }
    };

    Plotly.newPlot('graph1', data_error, nba_box_layout);
    
    
    //Scatter Plot

    let nba_opp_home_trace = {
      x: Team_win_array,
      y: data.altitude,
      name: 'Home Win % vs Similar Opp',
      mode: 'markers',
      type: 'scatter'
    };

    var nba_graph_data = [nba_opp_home_trace];

    var layout_nba={
      title: { 
        text: `NBA Win % vs Altitude`,
      },
      xaxis: {
        range: [0.4, 0.75],
        showlegend: false,
      },
      xaxis: {
        title: "Home Win % vs Similar Opp"
      },
      yaxis: {
        title: "Altitude"
      },
      margin: {
        l: 60,
        r: 50,
        b: 50,
        t: 50
      },
      height: 500,
      width: 350,
    };

  Plotly.newPlot('graph2', nba_graph_data, layout_nba);

  })
};

//Sets map for basketball teams
function nba_maps() {
  let League_map = L.map("map", {
    center: [38, -100],
    zoom: 4.45,
  });
  
  L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoic2Jyb3duMTQ2IiwiYSI6ImNrMWUycThmajBhZzIzYm11bjRqMDRvamQifQ.M22-sX0fWx_QGYGZQpRDGw", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      // id: "mapbox.streets-basic",
      id: "mapbox.outdoors",
    }).addTo(League_map);

    // nba_uri = "https://api.sportsdata.io/v3/nba/scores/json/Stadiums?key=347c7cf39a8b4f58906ce63f2ac52906";
    // d3.json(nba_uri, function(data){
    d3.json("nba_stadiums.json", function(data){
  
      let nba_stadium=[];
      let nba_lat=[]
      let nba_long=[];
  
      // Reference array for team names
      let nba_team_names=["Washington Wizards", "Charlotte Hornets", "Atlanta Hawks", "Miami Heat", "Orlando Magic", "New York Knicks", "Philadelphia 76ers", "Brooklyn Nets", "Boston Celtics", "Toronto Raptors", "Chicago Bulls", "Cleveland Cavaliers", "Indiana Pacers", "Detroit Pistons", "Milwaukee Bucks", "Minnesota Timberwolves", "Utah Jazz", "Oklahoma City Thunder", "Portland TrailBlazers", "Denver Nuggets", "Memphis Grizzlies", "Houston Rockets", "New Orleans Pelicans", "San Antonio Spurs", "Dallas Mavericks", "Golden State Warriors", "Los Angeles Lakers/Clippers", "Phoenix Sun", "Sacramento Kings"];
  
      // Reference array for team altitude
      let nba_altitude=[30, 750, 1000, 5, 60, 25, 10, 30, 5, 20, 600, 700, 750, 950, 600, 800, 4200, 1200, 60, 5300, 250, 30, 5, 650, 500, 10, 250, 1100, 25];


      // These loops get the data into the correct form for leaflet
      for (let i = 0; i < data.length; i++){
        nba_stadium.push(data[i].Name);
        nba_lat.push(data[i].GeoLat);
        nba_long.push(data[i].GeoLong);
      }
  
      for (let j = 0; j < 30; j++) {
          let nba_teams = [
            {
              name: nba_team_names[j],
              stadium_name: nba_stadium[j],
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
          
            // Displays altitude as a dynamic marker while displaying team names, stadium names and altitude.
            L.circle(nba_teams[i].location, {
              fillOpacity: 0.55,
              color: "white",
              fillColor: color,
              radius: nba_teams[i].altitude * 100
            }).bindPopup("<h3>" + nba_teams[i].name + "</h3> <h4> NBA: " + nba_teams[i].stadium_name + "</h4> <hr> <h5>Altitude: " + nba_teams[i].altitude + " feet</h5>").addTo(League_map);
          }
        }  
    });
};


//Sets graph for mlb teams
function mlb_graphs() {
  d3.json("/mlb_data", function(error, data){
    if (error) return console.warn(error);

    // Plot data
    Team_win_array=[];
    let mc_mean=[];
    let mc_std=[];
    MLB_array=[];
    MLB_altitude=[];

    //Home winning average for 5 seasons using dynamic variable naming.
    for (let i = 0; i < data.altitude.length; i++){
        eval("var Team_win_array_mlb"+i+"=[data.similar_opp_home_1["+i+"]*1 + data.similar_opp_home_2["+i+"]*1 + data.similar_opp_home_3["+i+"]*1 + data.similar_opp_home_4["+i+"]*1 + data.similar_opp_home_5["+i+"]*1]/5");
        eval("Team_win_array.push(Team_win_array_mlb"+i+")");
        eval("var mc_mlb"+i+"=monteCarlo(10000, Team_win_array_mlb"+i+", 40)");
        eval("mc_mean.push(mc_mlb"+i+".Mean)");
        eval("mc_std.push(mc_mlb"+i+".Std*1.96)");
        eval("MLB_array.push(Team_win_array_mlb"+i+")");
        eval("MLB_altitude.push(data.altitude["+i+"]*1)");
    };
    console.log(MLB_array);
    // Error Plot

    let mlb_data_error = [
      {
        x: Team_win_array,
        y: data.team,
        mode: "markers",
        error_x: {
          type: 'data',
          symmetric: false,
          array: mc_std,
          arrayminus: mc_std
        },
        type: 'scatter'
      }
    ];

    let mlb_box_layout = {
      showlegend: false,
      range: [0.4, 0.75],
      title: 'Simulated Home Win %',
      margin: {
        l: 140,
        r: 50,
        b: 50,
        t: 50
      },
      width: 450,
      height: 500,
      xaxis: {
        title: "Probably of Home Win vs Similar Opponent"
      },
      yaxis: {
        tickangle: 0,
        tickfont: {
          size: 10
        },
      }
    };

    Plotly.newPlot('graph1', mlb_data_error, mlb_box_layout);
    
    
    //Scatter Plot

    let mlb_opp_home_trace = {
      x: Team_win_array,
      y: data.altitude,
      name: 'Home Win % vs Similar Opp',
      mode: 'markers',
      type: 'scatter'
    };

    let mlb_graph_data = [mlb_opp_home_trace];

    let layout_mlb={
      title: { 
        text: `MLB Win % vs Altitude`,
      },
      xaxis: {
        range: [0.4, 0.75],
        showlegend: false,
        //dtick: 0.5
      },
      xaxis: {
        title: "Home Win % vs Similar Opp"
      },
      yaxis: {
        title: "Altitude"
      },
      margin: {
        l: 60,
        r: 50,
        b: 50,
        t: 50
      },
      height: 500,
      width: 350,
    };

  Plotly.newPlot('graph2', mlb_graph_data, layout_mlb);

  })
};

//Sets map for baseball teams
function mlb_maps() {
  let League_map = L.map("map", {
    center: [38, -100],
    zoom: 4.45,
  });
  
  L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoic2Jyb3duMTQ2IiwiYSI6ImNrMWUycThmajBhZzIzYm11bjRqMDRvamQifQ.M22-sX0fWx_QGYGZQpRDGw", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      // id: "mapbox.streets-basic",
      id: "mapbox.outdoors",
    }).addTo(League_map);

  // let mlb_uri = `https://api.sportsdata.io/v3/mlb/scores/json/Stadiums?key=96bd58dc56684c418ee3b279caaf634e`;
  // d3.json(mlb_uri, function(data){
  d3.json("mlb_stadiums.json", function(data){

    let mlb_stadium=[];
    let mlb_lat=[]
    let mlb_long=[];
    let mlb_altitude=[];

    // These are fixing indexing issues with the API.
    let mlb_index_lookup = [1, 8, 10, 13, 14, 18, 19, 21, 22, 23, 25, 27, 28, 29, 31, 33, 35, 41, 42, 44, 50, 51, 53, 54, 57, 62, 63, 64, 65, 68]; 
    
    let mlb_team_names=["San Diego Padres", "2", "3", "4", "5", "6", "7", "New York Mets", "9", "Cleveland Indians",  "11", "12", "San Francisco Giants", "Minnesota Twins",  "15", "16", "17", "Tampa Bay Rays", "Milwaukee Brewers",  "20", "Texas Rangers", "Baltimore Orioles", "Oakland Athletics",  "24", "Chicago White Sox",  "26", "Chicago Cubs", "Los Angeles Angels", "Pittsburgh Pirates",  "30", "Los Angeles Dodgers",  "32", "Kansas City Royals", "34", "New York Yankess",  "36", "37", "38", "39", "40", "St. Louis Cardinals", "Toronto Blue Jays",  "43", "Colorado Rockies", "45", "46", "47", "48", "49", "Boston Red Sox", "Philadelphia Phillies", "52", "Washington Nationals", "Arizona Diamondbacks", "55", "56", "Florida Marlins", "58", "59", "60", "61", "Detroit Tigers", "Houston Astros", "Cincinnati Reds", "Seattle Mariners", "66","67","Atlanta Braves"];

    // These loops get the data into the correct form for leaflet
    for (let i = 0; i < data.length; i++){
        mlb_stadium.push(data[i].Name);
        mlb_lat.push(data[i].GeoLat);
        mlb_long.push(data[i].GeoLong);
        mlb_altitude.push(data[i].Altitude);
    }

    for (let j of mlb_index_lookup) {
        let mlb_teams = [
          {
            name: mlb_team_names[j-1],
            stadium_name: mlb_stadium[j-1],
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
        
          // Displays altitude as a dynamic marker while displaying team names, stadium names and altitude.
          L.circle(mlb_teams[i].location, {
            fillOpacity: 0.55,
            color: "white",
            fillColor: color,
            radius: mlb_teams[i].altitude * 100
          }).bindPopup("<h3>" + mlb_teams[i].name + "</h3> <h4> MLB: " + mlb_teams[i].stadium_name + "</h4> <hr> <h5>Altitude: " + mlb_teams[i].altitude + " feet</h5>").addTo(League_map);
        }
      }
  });
};


//Sets graph for nfl teams
function nfl_graphs() {
  d3.json("/nfl_data", function(error, data){
    if (error) return console.warn(error);

    // Plot data
    Team_win_array=[];
    let mc_mean=[];
    let mc_std=[];
    NFL_array=[];
    NFL_altitude=[];
  
    //Home winning average for 5 seasons using dynamic variable naming.
    for (let i = 0; i < data.altitude.length; i++){
        eval("var Team_win_array_nfl"+i+"=[data.similar_opp_home_1["+i+"]*1 + data.similar_opp_home_2["+i+"]*1 + data.similar_opp_home_3["+i+"]*1 + data.similar_opp_home_4["+i+"]*1 + data.similar_opp_home_5["+i+"]*1]/5");
        eval("Team_win_array.push(Team_win_array_nfl"+i+")");
        eval("var mc_nfl"+i+"=monteCarlo(10000, Team_win_array_nfl"+i+", 5)");
        eval("mc_mean.push(mc_nfl"+i+".Mean)");
        eval("mc_std.push(mc_nfl"+i+".Std*1.96)");
        eval("NFL_array.push(Team_win_array_nfl"+i+")");
        eval("NFL_altitude.push(data.altitude["+i+"]*1)");
    };

    // Error Plot

    let nfl_data_error = [
      {
        x: Team_win_array,
        y: data.team,
        mode: "markers",
        error_x: {
          type: 'data',
          symmetric: false,
          array: mc_std,
          arrayminus: mc_std
        },
        type: 'scatter'
      }
    ];

    let nfl_box_layout = {
      showlegend: false,
      range: [0.4, 0.75],
      title: 'Simulated Home Win %',
      margin: {
        l: 140,
        r: 50,
        b: 50,
        t: 50
      },
      width: 450,
      height: 500,
      xaxis: {
        title: "Probably of Home Win vs Similar Opponent"
      },
      yaxis: {
        tickangle: 0,
        tickfont: {
          size: 9
        },
      }
    };

    Plotly.newPlot('graph1', nfl_data_error, nfl_box_layout);
    
    
    //Scatter Plot

    let nfl_opp_home_trace = {
      x: Team_win_array,
      y: data.altitude,
      name: 'Home Win % vs Similar Opp',
      mode: 'markers',
      type: 'scatter'
    };

    let nfl_graph_data = [nfl_opp_home_trace];

    let layout_nfl={
      title: { 
        text: `NFL Win % vs Altitude`,
      },
      xaxis: {
        range: [0.4, 0.75],
        showlegend: false,
        //dtick: 0.5
      },
      xaxis: {
        title: "Home Win % vs Similar Opp"
      },
      yaxis: {
        title: "Altitude"
      },
      margin: {
        l: 60,
        r: 50,
        b: 50,
        t: 50
      },
      height: 500,
      width: 350,
    };

  Plotly.newPlot('graph2', nfl_graph_data, layout_nfl);

  })
};

//Sets map for football teams
function nfl_maps() {
  let League_map = L.map("map", {
    center: [38, -100],
    zoom: 4.45,
  });
  
  L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoic2Jyb3duMTQ2IiwiYSI6ImNrMWUycThmajBhZzIzYm11bjRqMDRvamQifQ.M22-sX0fWx_QGYGZQpRDGw", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      // id: "mapbox.streets-basic",
      id: "mapbox.outdoors",
    }).addTo(League_map);

  // let nfl_uri = "https://api.sportsdata.io/v3/nfl/scores/json/Stadiums?key=69f17d50cebe453f802706181a4d33b0";
  // d3.json(nfl_uri, function(data){
  d3.json("nfl_stadiums.json", function(data){

    let nfl_stadium=[];
    let nfl_lat=[]
    let nfl_long=[];

    // Reference array for team names
    let nfl_team_names=["Buffalo Bills", "Miami Dolphins", "New York Jets/Giants", "New England Patriots", "Cincinnati Bengals", "Cleveland Browns", "Baltimore Ravens", "Pittsburgh Steelers", "Indianapolis Colts", "Jacksonville Jaguars", "Houston Texans", "Tennessee Titans", "Denver Broncos", "San Diego Chargers", "Kansas City Chiefs", "Oakland Raiders", "Dallas Cowboys", "Philadelphia Eagles", "Washington Redskins", "Chicago Bears", "Detroit Lions", "Green Bay Packers", "Minnesota Vikings", "Tampa Bay Buccaneers", "Atlanta Falcons", "Carolina Panthers", "New Orleans Saints", "San Francisco 49ers", "Arizona Cardinals", "St. Louis Rams", "Seattle Seahawks"];

    // Reference array for team altitudes
    let nfl_altitude=[866, 10, 7, 289, 482, 580, 10, 712, 715, 16, 49, 597, 5280, 52, 889, 43, 604, 39, 207, 590, 600, 640, 849, 52, 997, 751, 3, 26, 1070, 466, 16];

    // These loops get the data into the correct form for leaflet
    for (let i = 0; i < data.length; i++){
      nfl_stadium.push(data[i].Name);
      nfl_lat.push(data[i].GeoLat);
      nfl_long.push(data[i].GeoLong);
    }

    for (let j = 0; j < 31; j++) {
        let nfl_teams = [
          {
            name: nfl_team_names[j],
            stadium_name: nfl_stadium[j],
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
        
          // Displays altitude as a dynamic marker while displaying team names, stadium names and altitude.
          L.circle(nfl_teams[i].location, {
            fillOpacity: 0.55,
            color: "white",
            fillColor: color,
            radius: nfl_teams[i].altitude * 100
          }).bindPopup("<h3>" + nfl_teams[i].name + "</h3> <h4> NFL: " + nfl_teams[i].stadium_name + "</h4> <hr> <h5>Altitude: " + nfl_teams[i].altitude + " feet</h5>").addTo(League_map);
        }
      }     
  });
};


//Sets graph for nhl teams
function nhl_graphs() {
  d3.json("/nhl_data", function(error, data){
    if (error) return console.warn(error);

    // Plot data
    Team_win_array=[];
    let mc_mean=[];
    let mc_std=[];
    NHL_array=[];
    NHL_altitude=[];
  
    //Home winning average for 5 seasons using dynamic variable naming.
    for (let i = 0; i < data.altitude.length; i++){
        eval("var Team_win_array_nhl"+i+"=[data.similar_opp_home_1["+i+"]*1 + data.similar_opp_home_2["+i+"]*1 + data.similar_opp_home_3["+i+"]*1 + data.similar_opp_home_4["+i+"]*1 + data.similar_opp_home_5["+i+"]*1]/5");
        eval("Team_win_array.push(Team_win_array_nhl"+i+")");
        eval("var mc_nhl"+i+"=monteCarlo(10000, Team_win_array_nhl"+i+", 20)");
        eval("mc_mean.push(mc_nhl"+i+".Mean)");
        eval("mc_std.push(mc_nhl"+i+".Std*1.96)");
        eval("NHL_array.push(Team_win_array_nhl"+i+")");
        eval("NHL_altitude.push(data.altitude["+i+"]*1)");
    };

    // Error Plot

    let nhl_data_error = [
      {
        x: Team_win_array,
        y: data.team,
        mode: "markers",
        error_x: {
          type: 'data',
          symmetric: false,
          array: mc_std,
          arrayminus: mc_std
        },
        type: 'scatter'
      }
    ];

    let nhl_box_layout = {
      showlegend: false,
      range: [0.4, 0.75],
      title: 'Simulated Home Win %',
      margin: {
        l: 140,
        r: 50,
        b: 50,
        t: 50
      },
      width: 450,
      height: 500,
      xaxis: {
        title: "Probably of Home Win vs Similar Opponent"
      },
      yaxis: {
        tickangle: 0,
        tickfont: {
          size: 10
        },
      }
    };

    Plotly.newPlot('graph1', nhl_data_error, nhl_box_layout);
    
    
    //Scatter Plot

    let nhl_opp_home_trace = {
      x: Team_win_array,
      y: data.altitude,
      name: 'Home Win % vs Similar Opp',
      mode: 'markers',
      type: 'scatter'
    };

    let nhl_graph_data = [nhl_opp_home_trace];

    let layout_nhl={
      title: { 
        text: `NHL Win % vs Altitude`,
      },
      xaxis: {
        range: [0.4, 0.75],
        showlegend: false,
        //dtick: 0.5
      },
      xaxis: {
        title: "Home Win % vs Similar Opp"
      },
      yaxis: {
        title: "Altitude"
      },
      margin: {
        l: 60,
        r: 50,
        b: 50,
        t: 50
      },
      height: 500,
      width: 350,
    };

  Plotly.newPlot('graph2', nhl_graph_data, layout_nhl);

  })
};

//Sets map for hockey teams
function nhl_maps() {
  let League_map = L.map("map", {
    center: [38, -100],
    zoom: 4.45,
  });
  
  L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoic2Jyb3duMTQ2IiwiYSI6ImNrMWUycThmajBhZzIzYm11bjRqMDRvamQifQ.M22-sX0fWx_QGYGZQpRDGw", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      // id: "mapbox.streets-basic",
      id: "mapbox.outdoors",
    }).addTo(League_map);

    // let nhl_uri = "https://api.sportsdata.io/v3/nhl/scores/json/Stadiums?key=58e0c90ff51242fba96ca913e355a656";
    // d3.json(nhl_uri, function(data){
    d3.json("nhl_stadiums.json", function(data){
  
      let nhl_stadium=[];
      let nhl_lat=[]
      let nhl_long=[];
  
      // Reference array for team names
      let nhl_team_names=["Anaheim Ducks", "Arizona Coyotes", "Boston Bruins", "Buffalo Sabres", "Carolina Hurricanes", "Columbus Blue Jackets", "Calgary Flames", "Chicago Blackhawks", "Colorado Avalanche", "Dallas Stars", "Detroit Red Wings", "Edmonton Oilers", "Florida Panthers", "Los Angeles Kings", "Minnesota Wild", "Montreal Canadians", "Nashville Predators", "New Jersey Devils", "New York Islanders", "New York Rangers", "Ottawa Senators", "Philadelphia Flyers", "Pittsburgh Penguins", "San Jose Sharks", "St. Louis Blues", "Tampa Bay Lightning", "Toronto Maple Leafs", "Vancouver Canucks", "Washington Capitals", "Winnipeg Jets"];
  
      // Reference array for team altitudes
      let nhl_altitude=[163, 1071, 10, 580, 431, 736, 3425, 593, 5191, 426, 580, 2189, 17, 239, 790, 97, 447, 34, 35, 46, 323, 18, 808, 87, 473, 14, 260, 23, 46, 762];
  
      nhl_altitude.sort(function(a,b){ return b-a});
      console.log(nhl_altitude)

      // These loops get the data into the correct form for leaflet
      for (let i = 0; i < data.length; i++){
        nhl_stadium.push(data[i].Name);
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
          
            // Displays altitude as a dynamic marker while displaying team names, stadium names and altitude.
            L.circle(nhl_teams[i].location, {
              fillOpacity: 0.55,
              color: "white",
              fillColor: color,
              radius: nhl_teams[i].altitude * 100
            }).bindPopup("<h3>" + nhl_teams[i].name + "</h3> <h4> NHL: " + nhl_teams[i].stadium_name + "</h4> <hr> <h5>Altitude: " + nhl_teams[i].altitude + " feet</h5>").addTo(League_map);
          }
        }
    })
};


// These 2 functions control what is displayed when selections are made in each dropdown menu.

//Populates team list whenever league option is changed and gets the first teams data.
function option_League(different_selection) {
  if (different_selection == "MLB") {
    d3.json("/mlb", function(error, data) {
      if (error) return console.warn(error);
  
      d3.select("#Team_select").html("");
      let selector = d3.select("#Team_select");

      //Set the league_set marker
      league_set="MLB";

      d3.select("#map-header").html("");
      d3.select("#map-header").append("h3").text(`Altitude for ${different_selection} Teams`);
  
      data.forEach((team) => {
      selector.append("option").text(team).property("value", team);
      })
      mlb_graphs();
      init_team(data[0]);
      mlb_maps();
    })
  }
  else if (different_selection == "NFL") {
    d3.json("/nfl", function(error, data) {
      if (error) return console.warn(error);
  
      d3.select("#Team_select").html("");
      let selector = d3.select("#Team_select");

      //Set the league_set marker
      league_set="NFL";

      d3.select("#map-header").html("");
      d3.select("#map-header").append("h3").text(`Altitude for ${different_selection} Teams`);
  
      data.forEach((team) => {
      selector.append("option").text(team).property("value", team);
      })
      nfl_graphs();
      init_team(data[0]);
      nfl_maps();
    })
  } 
  else if (different_selection == "NHL") {
    d3.json("/nhl", function(error, data) {
      if (error) return console.warn(error);
  
      d3.select("#Team_select").html("");
      let selector = d3.select("#Team_select");

      //Set the league_set marker
      league_set="NHL";

      d3.select("#map-header").html("");
      d3.select("#map-header").append("h3").text(`Altitude for ${different_selection} Teams`);
  
      data.forEach((team) => {
      selector.append("option").text(team).property("value", team);
      })
      nhl_graphs()
      init_team(data[0]);
      nhl_maps();
    })
  }
  else {
    d3.select("#map-header").html("");
    d3.select("#map-header").append("h3").text("Altitude for NBA Teams");

    //Set the league_set marker
    league_set="NBA";
    d3.select("#Team_select").html("");
    nba_graphs();
    nba_data();
    nba_maps();
  }
};

//Gets stats for the selected team.
function option_Team(different_selection){
  d3.json ("/league/"+different_selection, function(error, data){

    d3.select(".panel-title").html("");
    d3.select("#option-data").html("");

    // Every element is multiplied by 1 to make sure it is set as a numeric variable.
    // These calculate percentages for wins, home wins and home wins against similar opponents.
    let team_wins = (data.win_pct_1*1 + data.win_pct_2*1 + data.win_pct_3*1 + data.win_pct_4*1 + data.win_pct_5*1)/5;

    let team_home_wins = (data.home_win_pct_1*1 + data.home_win_pct_2*1 + data.home_win_pct_3*1 + data.home_win_pct_4*1 + data.home_win_pct_5*1)/5;

    let team_home_opp_wins = (data.similar_opp_home_1*1 + data.similar_opp_home_2*1 + data.similar_opp_home_3*1 + data.similar_opp_home_4*1 + data.similar_opp_home_5*1)/5;

    // Adds team data to the panel
    d3.select(".panel-title").text(`Stats for: ${data.team}`);
    d3.select("#option-data").append("h5").text(`League: ${data.league}`);
    d3.select("#option-data").append("h5").text(`Altitude: ${data.altitude} feet`);
    d3.select("#option-data").append("h5").text(`Win Pct: ${((team_wins)*100).toFixed(2)}%`);
    d3.select("#option-data").append("h5").text(`Home Win Pct: ${((team_home_wins)*100).toFixed(2)}%`);
    d3.select("#option-data").append("h5").text(`Home Win Pct vs Similar Opponents: ${((team_home_opp_wins)*100).toFixed(2)}%`);

    // This is where the league_set variable is used as the correlation variable displays for the correct league.
    if (league_set=="NBA") {
      d3.select("#option-data").append("h5").text(`Correlation for Home Win Pct vs Similar Opponent and Altitude: ${(pcorr(NBA_array, NBA_altitude)).toFixed(2)}`);
    }
    else if (league_set=="NFL") {
      d3.select("#option-data").append("h5").text(`Correlation for Home Win Pct vs Similar Opponent and Altitude: ${(pcorr(NFL_array, NFL_altitude)).toFixed(2)}`);
    }
    else if (league_set=="MLB") {
      d3.select("#option-data").append("h5").text(`Correlation for Home Win Pct vs Similar Opponent and Altitude: ${(pcorr(MLB_array, MLB_altitude)).toFixed(2)}`);
    }
    else {
      d3.select("#option-data").append("h5").text(`Correlation for Home Win Pct vs Similar Opponent and Altitude: ${(pcorr(NHL_array, NHL_altitude)).toFixed(2)}`);
    };

  })
};

init();