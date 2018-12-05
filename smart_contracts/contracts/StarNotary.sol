pragma solidity ^0.4.23;

import "../node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";

contract StarNotary is ERC721 { 

    // This is to be used to auto-generate token ids
    uint256 public tokenQuantity;

    struct Star { 
        string name;
        string story;
        Coordinates coordinates;
    }

    struct Coordinates {
        string ra;
        string dec;
        string mag;
    }

    mapping(uint256 => Star) public tokenIdToStarInfo; 
    mapping(uint256 => uint256) public starsForSale;
    mapping(bytes32 => bool) public coordinatesToStarExists;

    function createStar(string _name, string _story, string _ra, string _dec, string _mag) public { 
        // Check for existance of required values
        require(compareStrings(_name, "") == false, "_name not specified and it's required.");
        require(compareStrings(_ra, "") == false, "_ra not specified and it's required.");
        require(compareStrings(_dec, "") == false, "_dec not specified and it's required.");
        require(compareStrings(_mag, "") == false, "_mag not specified and it's required.");
        
        Coordinates memory coordinates = Coordinates(_ra, _dec, _mag);
        Star memory newStar = Star(_name, _story, coordinates);

        string memory serializedCoordinates = concatThreeStrings(coordinates.ra, coordinates.dec, coordinates.mag);
        bytes32 starCoordinatesHash = keccak256(bytes(serializedCoordinates));
        require(coordinatesToStarExists[starCoordinatesHash] != true, "Fail to create star: A star with those coordinates already exists.");

        uint256 _tokenId = tokenQuantity++;
        tokenIdToStarInfo[_tokenId] = newStar;
        coordinatesToStarExists[starCoordinatesHash] = true;
        
        _mint(msg.sender, _tokenId);
    }

    function putStarUpForSale(uint256 _tokenId, uint256 _price) public { 
        require(this.ownerOf(_tokenId) == msg.sender);

        starsForSale[_tokenId] = _price;
    }

    function buyStar(uint256 _tokenId) public payable { 
        require(starsForSale[_tokenId] > 0);
        
        uint256 starCost = starsForSale[_tokenId];
        address starOwner = this.ownerOf(_tokenId);
        require(msg.value >= starCost);

        _removeTokenFrom(starOwner, _tokenId);
        _addTokenTo(msg.sender, _tokenId);
        
        starOwner.transfer(starCost);

        if(msg.value > starCost) { 
            msg.sender.transfer(msg.value - starCost);
        }
    }

    function mint(uint256 _tokenId) public {
        super._mint(msg.sender, _tokenId);
    }

    function compareStrings(string first, string second) internal returns (bool) {
        return keccak256(bytes(first)) == keccak256(bytes(second));
    }

    function concatThreeStrings(string first, string second, string third) internal returns (string) {
        bytes memory _first = bytes(first);
        bytes memory _second = bytes(second);
        bytes memory _third = bytes(third);
        string memory finalStringLength = new string(_first.length + _second.length + _third.length);
        bytes memory finalStringBytes = bytes(finalStringLength);
        uint k = 0;
        uint i = 0;
        for (i = 0; i < _first.length; i++) finalStringBytes[k++] = _first[i];
        for (i = 0; i < _second.length; i++) finalStringBytes[k++] = _second[i];
        for (i = 0; i < _third.length; i++) finalStringBytes[k++] = _third[i];
        return string(finalStringBytes); 
    }

    function tokenIdToStarData(uint256 _tokenId) public view returns (string, string, string, string, string) {
        Star memory star = tokenIdToStarInfo[_tokenId];
        return (star.name, star.story, star.coordinates.ra, star.coordinates.dec, star.coordinates.mag);
    }
}