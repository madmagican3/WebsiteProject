var expect = require('chai').expect;
var MongoController = require('../Controller/MongoController');

describe("Insertion and find DB", function () {
    var result;

    before(function (done) {
        MongoController.insertIntoDB("TestDB", "spec", {"TestVal": "1"}, function (err, res) {
            MongoController.findFromDB("TestDB", "spec", {"TestVal": "1"}, function (err, res) {
                result = res;
                done();
            });
        });
    });
    it("This should check the insertion and find worked", function () {
        expect(result.TestVal).to.be.equal("1");
    });
});

describe("fail case for fetching from the db", function () {
    var result;

    before(function (done) {
        MongoController.findFromDB("TestDB", "spec", {"TestVal": "2"}, function (err, res) {
            result = res;
            done();
        });
    });
    it("Checks on an empty return", function () {
        expect(result).to.equal(null);
    });

});

describe("insertion and find multiple", function () {
    var result;

    before(function (done) {
        MongoController.insertIntoDB("TestDB", "spec", {"TestVal": "3"}, function (err, res) {
            MongoController.insertIntoDB("TestDB", "spec", {"TestVal": "4"}, function (err, res) {
                MongoController.findMultipleFromDB("TestDB", "spec", {}, function (err, res) {
                    result = res;
                    done();
                });
            });
        });
    });
    it("This should check the insertion and find worked", function () {
        var oneIncluded = false;
        var twoIncluded = false;
        result.forEach(function(res){
            if (res.TestVal == "3")
                oneIncluded = true;
            if (res.TestVal == "4")
                twoIncluded = true;
        });
        expect(oneIncluded && twoIncluded).to.equal(true);
    });
});


describe("insert one and update it", function () {
    var result;

    before(function (done) {
        MongoController.insertIntoDB("TestDB", "spec", {"TestVal": "5"}, function (err, res) {
            MongoController.replaceOneInDb("TestDB", "spec", {"TestVal": "5"}, {"TestVal": "6"}, function (err, res) {
                MongoController.findMultipleFromDB("TestDB", "spec", {}, function (err, res) {
                    result = res;
                    done();
                });
            });
        });
    });
    it("Check if the update worked", function () {
        passed = false;
        result.forEach(function(res){
            console.log(res.TestVal);
            if (res.TestVal == "6")
                passed = true;
        });
        expect(passed).to.equal(true);
    });
});

describe("Delete all and verify that they were deleted", function () {
    var result;

    before(function (done) {
            MongoController.deleteRecordsFromDb("TestDB", "spec", {}, true, function (err, res) {
                MongoController.findFromDB("TestDB", "spec", {}, function (err, res) {
                    result = res;
                    done();
                });
        });
    });
    it("This should check if the delete worked", function () {
        expect(result).to.equal(null);
    });
});