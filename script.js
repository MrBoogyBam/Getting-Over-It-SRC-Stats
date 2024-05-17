let moderators = [];
let maxRuns = document.getElementById("maxRuns");
let runStatusSelection = document.getElementById("runStatusSelection");

document.addEventListener("DOMContentLoaded", showPieChart);

maxRuns.oninput = function() {
    maxRuns.value = maxRuns.value.replace(/[^0-9]/g, '');

    if(maxRuns.value > 200) maxRuns.value = 200;
    if(maxRuns.value == "") maxRuns.value = 0;
    if(maxRuns.value.startsWith("0") && maxRuns.value.length > 1) {
        let slicedVal = maxRuns.value.slice(1);

        maxRuns.value = slicedVal;
    }

    updatePieChart();
};

runStatusSelection.onchange = function() {
    updatePieChart();
}

function showPieChart() {
    fetch("https://www.speedrun.com/api/v1/games?name=goiwbf").then(response => {
        if(!response.ok) {
            throw new Error("Network response was not ok " + response.statusText);
        }

        return response.json();
    }).then(gameData => {
        fetch(`https://www.speedrun.com/api/v1/runs?game=pd0wx9w1&max=${maxRuns.value}&orderby=date&direction=desc`).then(response => {
            if(!response.ok) {
                throw new Error("Network response was not ok " + response.statusText);
            }

            return response.json();
        }).then(runsData => {
            Object.keys(gameData.data[0].moderators).forEach((modValue, index) => {
                let count = 0;

                Object.values(runsData.data).forEach((runsValue, _) => {
                    if(runStatusSelection.value == 0) {
                        if(runsValue.status.examiner == modValue) {
                            count++;
                        }
                    } else if(runStatusSelection.value == 1) {
                        if(runsValue.status.examiner == modValue && runsValue.status.status == "verified") {
                            count++;
                        }
                    } else {
                        if(runsValue.status.examiner == modValue && runsValue.status.status == "rejected") {
                            count++;
                        }
                    }
                });

                moderators.push({
                    id: modValue,
                    size: count,
                    color: generateRandomHSLValue(index, Object.keys(gameData.data[0].moderators).length)
                });
            });
    
            let values = [];
    
            moderators.forEach((value, _) => {
                values.push(value.size);
            })
    
            const total = values.reduce((acc, val) => acc + val, 0);
    
            let startAngle = 0;
    
            const canvas = document.getElementById("pie-chart");
            const ctx = canvas.getContext("2d");
    
            values.forEach((value, index) => {
                const angle = (value / total) * Math.PI * 2;
    
                ctx.beginPath();
                ctx.moveTo(canvas.width / 2, canvas.height / 2);
                ctx.arc(
                    canvas.width / 2,
                    canvas.height / 2,
                    canvas.width / 2,
                    startAngle,
                    startAngle + angle
                );
                ctx.closePath();
    
                ctx.fillStyle = moderators[index].color;
                ctx.fill();
    
                startAngle += angle;
            });

            moderators.sort((a, b) => b.size - a.size);

            const legend = document.getElementById("pie-chart-legend");

            moderators.forEach((value, _) => {
                fetch(`https://www.speedrun.com/api/v1/users/${value.id}`).then(response => {
                    if(!response.ok) {
                        throw new Error("Network response was not ok " + response.statusText);
                    }

                    return response.json();
                }).then(userData => {
                    let legendItem = document.createElement("div");
                    let legendColor = document.createElement("div");
                    let legendLabel = document.createElement("div");

                    legendItem.className = "legend-item";

                    legendColor.className = "legend-color";
                    legendColor.style.backgroundColor = value.color;

                    legendLabel.className = "legend-label";
                    legendLabel.id = `label-${userData.data.id}`;
                    legendLabel.innerHTML = `${userData.data.names.international}: ${value.size} - ${(value.size / total * 100).toFixed(2)}%`;

                    legendItem.appendChild(legendColor);
                    legendItem.appendChild(legendLabel);
                    legend.appendChild(legendItem);
                });
            });
        });
    });
}

function updatePieChart() {
    fetch("https://www.speedrun.com/api/v1/games?name=goiwbf").then(response => {
        if(!response.ok) {
            throw new Error("Network response was not ok " + response.statusText);
        }

        return response.json();
    }).then(gameData => {
        fetch(`https://www.speedrun.com/api/v1/runs?game=pd0wx9w1&max=${maxRuns.value}&orderby=date&direction=desc`).then(response => {
            if(!response.ok) {
                throw new Error("Network response was not ok " + response.statusText);
            }

            return response.json();
        }).then(runsData => {
            moderators.forEach((value, _) => {
                value.size = 0;
            });

            Object.keys(gameData.data[0].moderators).forEach((modValue, index) => {
                let count = 0;

                Object.values(runsData.data).forEach((runsValue, _) => {
                    if(runStatusSelection.value == 0) {
                        if(runsValue.status.examiner == modValue) {
                            count++;
    
                            moderators.find(x => x.id == runsValue.status.examiner).size = count;
                        }
                    } else if(runStatusSelection.value == 1) {
                        if(runsValue.status.examiner == modValue && runsValue.status.status == "verified") {
                            count++;
    
                            moderators.find(x => x.id == runsValue.status.examiner).size = count;
                        }
                    } else {
                        if(runsValue.status.examiner == modValue && runsValue.status.status == "rejected") {
                            count++;
    
                            moderators.find(x => x.id == runsValue.status.examiner).size = count;
                        }
                    }
                });
            });
    
            let values = [];
    
            moderators.forEach((value, _) => {
                values.push(value.size);
            })
    
            const total = values.reduce((acc, val) => acc + val, 0);
    
            let startAngle = 0;
    
            const canvas = document.getElementById("pie-chart");
            const ctx = canvas.getContext("2d");
    
            values.forEach((value, index) => {
                const angle = (value / total) * Math.PI * 2;
    
                ctx.beginPath();
                ctx.moveTo(canvas.width / 2, canvas.height / 2);
                ctx.arc(
                    canvas.width / 2,
                    canvas.height / 2,
                    canvas.width / 2,
                    startAngle,
                    startAngle + angle
                );
                ctx.closePath();
    
                ctx.fillStyle = moderators[index].color;
                ctx.fill();
    
                startAngle += angle;
            });

            moderators.sort((a, b) => b.size - a.size);

            const pieChartLegend = document.getElementById("pie-chart-legend");

            while(pieChartLegend.firstChild) {
                pieChartLegend.removeChild(pieChartLegend.firstChild);
            }

            console.log(document.getElementById("legend-item"));

            const legend = document.getElementById("pie-chart-legend");

            moderators.forEach((value, _) => {
                fetch(`https://www.speedrun.com/api/v1/users/${value.id}`).then(response => {
                    if(!response.ok) {
                        throw new Error("Network response was not ok " + response.statusText);
                    }

                    return response.json();
                }).then(userData => {
                    let legendItem = document.createElement("div");
                    let legendColor = document.createElement("div");
                    let legendLabel = document.createElement("div");

                    legendItem.className = "legend-item";

                    legendColor.className = "legend-color";
                    legendColor.style.backgroundColor = value.color;

                    legendLabel.className = "legend-label";
                    legendLabel.innerHTML = `${userData.data.names.international}: ${value.size} - ${(value.size / total * 100).toFixed(2)}%`;

                    legendItem.appendChild(legendColor);
                    legendItem.appendChild(legendLabel);
                    legend.appendChild(legendItem);
                });
            });
        });
    });
}

function generateRandomHSLValue(colorNum, colors) {
    if(colors < 1) colors = 1;

    return `hsl(${colorNum * (360 / colors) % 360}, 100%, 50%)`;
}