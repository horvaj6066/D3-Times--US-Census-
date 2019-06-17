// don't forget python -m http.server ------------------------------------------------------------
//define some arrays to hold our csv data 
var data=[];
var state=[];
var income=[];
var poverty=[];
var smokes=[];
var healthcare=[];
var obesity=[];
var circle_data=[];
var y_variable=[];
var y_string="smokes";
var first_pass=true;

// Define SVG area dimensions
var svgWidth = 1800;
var svgHeight =800;

// Define the chart's margins as an object
var chartMargin = {
  top: 30,
  right: 30,
  bottom: 30,
  left: 50
};
// Define dimensions of the chart area
var chartWidth = svgWidth - chartMargin.left - chartMargin.right;
var chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;


function main(){  //****************************************************************************
  d3.select("svg").remove(); // clear any existing charts 

  // Select body, append SVG area to it, and set the dimensions
  var svg = d3 //this is for the main container
    .select("body")
    .append("svg")
    .attr("height", svgHeight)
    .attr("width", svgWidth);

  // Append a group to the SVG area and shift ('translate') it to the right and down to adhere
  // to the margins set in the "chartMargin" object.
  var chartGroup = svg.append("g")
    .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);

  //lets read CSV file 
  d3.csv("data.csv").then(function(data) { //this looks right
    data.forEach(function(ddd) {  // each ddd is an object that is one row of data from the CSV
      var new_data=Object.values(ddd); //transform object into an array 
      state.push(+new_data[2]);// 2 letter abbreviation for state
      poverty.push(+new_data[3]);//
      income.push(+new_data[7]);//
      smokes.push(+new_data[15]);//
      obesity.push(+new_data[12]);
      healthcare.push(+new_data[9]); 
    });

    console.log("Y variable and string:", y_variable, y_string); //my variables are correct
    var scaleX = chartWidth/(d3.max(poverty)-d3.min(poverty));
    var scaleY = chartHeight/(d3.max(y_variable)-d3.min(y_variable));
 
    var circlesGroup = chartGroup.selectAll("circle") // this is for the bubbleplot 
    .data(data)
    .attr("class", "dot")
    .enter()
    .append("circle")
    .attr("cx", function(d) {
          return ((d["poverty"]-d3.min(poverty))*scaleX);
    })
    .attr("cy", function(d) {
          console.log(d[y_string]);
          //-d3.min(y_variable))*scaleY);
          return ((d[y_string]-d3.min(y_variable))*scaleY);
          
    })
    .attr("r", function(d){
        return ((d["income"]-d3.min(income))/500+10);
    })
    .attr("opacity", ".1")
    .attr("fill", "yellow")
    .attr("stroke-width","2")
    .style("stroke-opacity", "100%")
    .attr("stroke", "blue");
  

    console.log("appended circles with ", y_string);
    console.log("y variable is ", y_variable);

      //lets add labels for the circles, will do just centered state abbreviations 
      chartGroup.selectAll("text")
      .data(data)
      .enter()
      .append("text") 
      .text(function(d) { 
        return d["abbr"];
      })
      .attr("x", function(d) {
        return ((d["poverty"]-d3.min(poverty))*scaleX-7); // the number shift text to the right make it readable
      })
      .attr("y", function(d) {
        return ((d[y_string]-d3.min(y_variable))*scaleY+3);
      })
      .attr("font-family", "sans-serif")
      .attr("font-size", "12px")
      .attr("fill", "black");
  
      // scale y to chart height
      var yScale = d3.scaleLinear()
        .domain([d3.min(y_variable), d3.max(y_variable)])
        .range([0, chartHeight]);

      //  console.log(d3.min(poverty)) // ok the min is right 
      // scale x to chart width
      var xScale = d3.scaleLinear()
        .domain([d3.min(poverty),d3.max(poverty)])
        .range([0, chartWidth]);
        
      chartGroup.append("text") //this is the y axis text 
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 70)
        .attr("x", -50)
        .attr("font-family", "sans-serif")
        .attr("font-size", "18px")
        .style("text-anchor", "end")
        .text(y_string+" - % of population");

        chartGroup.append("text")
        .attr("class", "label")
        .attr("y", chartHeight - 30) //locate near bottom, this is x-axis text 
        .attr("x", 340)
        .attr("font-family", "sans-serif")
        .attr("font-size", "18px")
        .style("text-anchor", "end")
        .text("poverty - % of population");      

      // create axes
      var yAxis = d3.axisLeft(yScale);
      var xAxis = d3.axisBottom(xScale);

      // set x to the bottom of the chart
      chartGroup.append("g")
        .attr("transform", `translate(50, ${chartHeight})`)
        .call(xAxis);

      // set y to the y axis
      // This syntax allows us to call the axis function
      // and pass in the selector without breaking the chaining
      chartGroup.append("g")
        .attr("transform", `translate(100, 0)`)
        .call(yAxis);

    // add tooltips need to do some padding 

    var toolTip = d3.tip()
     //.select("circle").append("div")
     .attr("class","tooltip") 
     .offset([0,0])
     .html(function(d) {
       return(`${d.state} Income: $${d.income} Poverty: ${d.poverty}% \n Obesity: ${d.obesity}% Smokers: ${d.smokes}%  Without Healthcare: ${d.healthcare}%`)
     })
      //.style("display", "block")
      .attr("font-family", "sans-serif")
      .style("opacity", "1")
      .style("color", "black")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .attr("font-size", "10px")
      .attr("display", "block") //was attr changing to style("display", "inline")
      //.classed("tooltip", true)
      .style("padding", "5px");
      
     chartGroup.call(toolTip);

    // Step 2: Add an onmouseover event to display a tooltip
    circlesGroup.on("mouseover", function(d) { 
      //toolTip.style("display", "block")
      toolTip.show(d, this)

     /*console.log(this, "hello",d.income);
      toolTip.html(d.state + ` Avg Household Income: `+ d.income)
      .style("auto", d3.event.pageX + "px")
      .style("auto", d3.event.pageY + "px");
    */
   })
      // Step 3: Add an onmouseout event to make the tooltip invisible
      .on("mouseout", function(d) {
        toolTip.hide(d); 
      });
  
  }); 
  
  console.log("got to the bottoma after charts drawn ")
  }
function getData(dataset) {
  // Fill the x and y arrays as a function of the selected dataset
  switch (dataset) {
   case "smokes":
     y_variable = smokes; 
     y_string="smokes";
     console.log("option1", dataset);
     
     break;
   
     case "obesity":
     y_variable = obesity; 
     y_string="obesity";
     console.log("option2", dataset);
     //d3.select("svg").remove();
     
     break;

     case "healthcare":
     y_variable = healthcare; 
     y_string="healthcare";
     console.log("option3",dataset);
     //d3.select("svg").remove();
     d3.selectAll("circle").exit().remove();
    
     break;
   
     default:
     y_variable = smokes; 
     y_string="smokes"; 
     console.log('we are in default option- smokes');
     
     break;
   }
  console.log("about to call main with", y_string); 
  main();
}
console.log("end calling getdata then main function");
getData("obesity");
main();