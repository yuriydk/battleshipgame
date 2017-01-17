+function () {
    "use strict"

    angular.module("main", [])
        .service("game", ["$http", function ($http) {
            var gameData, battlefield, ships, score;

            var initBattlefield = function (ships, shipTypes) {
                for (let x = 0; x < 10; x++) {
                    let arr = [];
                    battlefield.push(arr);
                    for (let y = 0; y < 10; y++) {
                        arr.push({ isFired: false, ship: null });
                    }
                }

                ships.forEach(ship => {
                    ship.positions.forEach(position => {
                        battlefield[position[0]][position[1]].ship = ship;
                    })
                });

            }
            this.init = function () {
                gameData = null;
                battlefield = [];
                ships = [];
                score = 0;

                $http.get("/content/data.json")
                .then(response => {
                    ships = response.data.layout.map(ship => {
                        return {
                            type: ship.ship,
                            livePoints: response.data.shipTypes[ship.ship].size,
                            hits: 0,
                            positions: ship.positions
                        }
                    });
                    initBattlefield(ships, response.data.shipTypes);
                })
                .catch(response => {
                    //todo log
                });
            };

            this.fire = function (x, y) {
                var battlefieldCell = battlefield[x][y];
                if (!battlefieldCell.isFired) {
                    battlefieldCell.isFired = true;
                    if (battlefieldCell.ship) {
                        battlefieldCell.ship.hits++;
                        battlefieldCell.ship.livePoints--;
                        if (battlefieldCell.ship.livePoints == 0) {
                            score++;
                        }
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return !!battlefieldCell.ship;
                }
            };

            this.getScore = function () {
                return score;
            };

            this.getShips = function () {
                return ships;
            }
        }])
        .controller("BattleshipController", ["game", function (game) {

            this.fire = function (x, y) {

                this.gameArea[x][y] = game.fire(x, y);
            }

            this.reset = function () {
                this.gameArea = [];
                for (let x = 0; x < 10; x++) {
                    let arr = [];
                    this.gameArea.push(arr);
                    for (let y = 0; y < 10; y++) {
                        arr.push(null);
                    }
                }
                game.init();
            }

            this.reset();
        }])
        .component("infoBoard", {
            templateUrl: "/templates/infoBoard.html",
            controller: ["game", function (game) {
                this.getScore = function () {
                    return game.getScore();
                }

                this.getShipLivePoints = function (ship) {
                    var livePoints = [];
                    for (var i = 0; i < ship.livePoints + ship.hits; i++) {
                        livePoints.push(i < ship.hits);
                    }
                    return livePoints;
                }

                this.getShips = function () {
                    return game.getShips();
                }
            }],
            controllerAs: "ctrl"
        });
}();