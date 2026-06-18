export const challengeCode = `contract YieldVault {
    mapping(address => uint256) public balances;
    address public strategist;

    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount);
        (bool ok,) = msg.sender.call{value: amount}("");
        require(ok);
        balances[msg.sender] -= amount;
    }

    function setStrategist(address next) external {
        require(tx.origin == strategist);
        strategist = next;
    }
}`;
