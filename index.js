/** @format */

//* Intilize the Map
let map = L.map("map", {
  zoomAnimation: true,
}).setView([30, 30], 4);

//* Creating the BaseMap
var tiles = L.tileLayer(
  "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw",
  {
    maxZoom: 18,
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: "mapbox/light-v9",
    tileSize: 512,
    zoomOffset: -1,
  }
);

function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

function makeOptions() {
  let choices = [];
  let WhereStatment = `PeriodType='${startSearch.value}' and NationalLevelName='Egypt' `;
  query.where(WhereStatment);
  query.run((error, featureCollection) => {
    removeAllChildNodes(endtSearch);
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < featureCollection.features.length; i++) {
      const option = document.createElement("option");
      option.text = `${
        document.createTextNode(
          featureCollection.features[i].properties.PeriodData
        ).textContent
      }`;
      option.value = `${
        document.createTextNode(
          featureCollection.features[i].properties.PeriodData
        ).textContent
      }`;
      fragment.appendChild(option);

      // const textnode = document.createTextNode(featureCollection.features[i].properties.PeriodData);

      choices.push(featureCollection.features[i].properties.PeriodData);
    }
    endtSearch.appendChild(fragment);
  });
}

const Controller = L.control({
  position: "topright",
});

// we create a div with a Controller class
const div = L.DomUtil.create("div", "Controller");

// we add records to the L.control method
let rows;
Controller.onAdd = function () {
  rows = `
  <div class="input-group">
<label for="start"  class="input-group-text"> Date Type  </label>

<select name="select" id="start" class="form-select"      required   >
  <option value="Last 7 Days">Last 7 Days</option>
  <option value="Monthly">Monthly</option>
  <option value="Quarterly">Quarterly</option>
  <option value="Half Yearly">Half Yearly</option>
  <option value="Yearly"> Yearly</option>
  <option value="Total"> Total</option>
  
</select>
<br>
<label for="End " class="input-group-text"> Date Period </label>

<select name="select" id="end"     class="form-select"   required   >
   <option value="Last 7 Days">Last 7 Days</option>  
</select>



<button class="btn btn-outline-secondary" type="button" id="button">Search</button>

</div>
    `;
  div.innerHTML = rows;
  return div;
};

// we are adding a Controller to the map
Controller.addTo(map);

//* Setting the BaseMap
tiles.addTo(map);

L.esri.Support.cors = true;

//*Getting the elements Holding values
let startSearch = document.getElementById("start");
let endtSearch = document.getElementById("end");

//*Creating the Query of specific Dates
var query = L.esri.query({
  url: "https://services3.arcgis.com/1FS0hEOLnjHnov75/arcgis/rest/services/WHOThematicMap_gdb/FeatureServer/1",
});

startSearch.addEventListener("change", () => {
  makeOptions();
});

//*Event onClick to Make the Whole Query
document.getElementById("button").addEventListener("click", (e) => {
  e.preventDefault();

  //* Removing all map layers when reSubmit
  map.eachLayer(function (layer) {
    map.removeLayer(layer);
  });

  //* Setting the BaseMap
  tiles.addTo(map);

  let dataHolder = [];

  //* Getting values of Inputs
  let durationType = startSearch.value;
  let durationData = endtSearch.value;

  //*Where Statment Creation
  let WhereStatment = `PeriodType='${durationType}' and PeriodData='${durationData}' `;




  const fetching = async () => {
    const data = await fetch("./features.json");
    let res = await data.json();

    return res;
  };

  let addingData = async (res) => {
    [...res.features].forEach((element) => {
      dataHolder.forEach((x) => {
        if (x.properties.NationalLevelCode == element.properties.Code) {
          // console.log(   feature.geometry.coordinates.length , i)
          // console.log(x.properties, 1);

          element.properties["Confirmed"] = x.properties.ConfirmedCases;
          element.properties["Recovered"] = x.properties.RecoveredCases;
          element.properties["Death"] = x.properties.DeathCases;
        }
      });
    });
    return res;
  };

  let queryFeatuers = async (res) => {
    //* Excuting the WHERE statment
    query.where(WhereStatment);

    //* Running the Query
    query.run(function (error, featureCollection, response) {
      if (error) {
        console.log(error);
        return;
      }
      //* Assigning the data got from the Query to container
      dataHolder = featureCollection.features;

      console.log("Found " + featureCollection.features.length + " features");
      // console.log(featureCollection.features);
    });

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(res);
      }, 500);
    });
  };

  const finalRender = (result) => {
    //   L.geoJSON(result, {
    //     style: function (feature) {
    //       return {
    //         fillColor: getColor(feature.properties.Confirmed, durationType),
    //         weight: 2,
    //         opacity: 0.5,
    //         color: "white",
    //         dashArray: "3",
    //         fillOpacity: 0.7,
    //       };
    //     },
    //     onEachFeature: function (feature, layer) {
    //       // console.log(feature.properties.Confirmed);

    //       //* Here is the PopUp on each Feature, you Can Make a table in it
    //       if (
    //         feature.properties.Confirmed > 0 &&
    //         feature.properties.Confirmed != undefined
    //       ) {
    //         // console.log(feature.properties.Confirmed)
    //         layer.bindPopup(feature.properties.Confirmed.toString());
    //       } else {
    //         // console.log(feature.properties.Confirmed)
    //         layer.bindPopup(`<div>${feature.properties.Confirmed}</div>`);
    //       }
    //     },
    //   }).addTo(map);

    // console.log(result.features)
    if (result.features !== undefined) {
      // console.log(result.features);
      if (document.getElementsByClassName("legend").length != 0) {
        let element = document.getElementsByClassName("legend")[0];
        // console.log(element)
        element.remove();
      }
      let features = L.choropleth(result, {
        valueProperty: "Confirmed", // which property in the features to use
        scale: ["#FFEDA0", "#99000d"], // chroma.js scale - include as many as you like
        steps: 7, // number of breaks or steps in range
        mode: "q", // q for quantile, e for equidistant, k for k-means
        style: {
          color: "#fff", // border color
          weight: 2,
          fillOpacity: 0.7,
          dashArray: "3",
          opacity: 0.5,
        },
        onEachFeature: function (feature, layer) {
          // console.log(feature.properties.Confirmed);
          layer.bindPopup(`
          <table class="table">
  <thead>
    <tr>
      <th scope="col">Country</th>
      <th scope="col">${feature.properties.Country}</th>
    </tr>
  </thead>
  <tbody>
  <tr>
    <th scope="Flag">Flag</th>
    <td><img src="${feature.properties.Flags}" class="img-fluid">
    </td>

  </tr>
    <tr>
      <th scope="row">Population</th>
      <td>${feature.properties.Population}</td>

    </tr>
    <tr>
      <th scope="row">Confirmed</th>
      <td>${feature.properties.Confirmed}</td>

    </tr>
   
  </tbody>
</table>`);
        },
      }).addTo(map);

      // Add legend (don't forget to add the CSS from index.html)
      var legend = L.control({ position: "bottomright" });
      legend.onAdd = function (map) {
        var div = L.DomUtil.create("div", "info legend");
        var limits = features.options.limits;
        var colors = features.options.colors;
        var labels = [];

        // Add min & max
        div.innerHTML =
          '<div class="labels"><div class="min">' +
          limits[0] +
          '</div> \
			<div class="max">' +
          limits[limits.length - 1] +
          "</div></div>";

        limits.forEach(function (limit, index) {
          labels.push(
            '<li style="background-color: ' + colors[index] + '"></li>'
          );
        });

        div.innerHTML += "<ul>" + labels.join("") + "</ul>";
        return div;
      };
      legend.addTo(map);
    } else if (result.features == undefined) {
      console.log("second");
      asyncCall();
    }
  };

  async function asyncCall() {
    let res0 = await fetching();
    let res1 = await queryFeatuers(res0);
    let res2 = await addingData(res1);
    
    setTimeout( finalRender(res2) , 1000);
  }

  asyncCall();
});
