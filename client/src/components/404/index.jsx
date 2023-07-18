import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const ErrorPage = () => {
  const [showGame, setShowGame] = useState(false);

  const handleClick = () => {
    setShowGame(true);
  };

  const Game = () => {
    const [playerPosition, setPlayerPosition] = useState(0);
    const [blockPositions, setBlockPositions] = useState([]);
    const [gameOver, setGameOver] = useState(false);
    const gameContainerRef = useRef(null);
    const moveLeftRef = useRef(false);
    const moveRightRef = useRef(false);

    useEffect(() => {
      const handleKeyDown = (event) => {
        if (!gameOver) {
          if (event.keyCode === 37) {
            // Start moving player left
            moveLeftRef.current = true;
          } else if (event.keyCode === 39) {
            // Start moving player right
            moveRightRef.current = true;
          }
        }
      };

      const handleKeyUp = (event) => {
        if (!gameOver) {
          if (event.keyCode === 37) {
            // Stop moving player left
            moveLeftRef.current = false;
          } else if (event.keyCode === 39) {
            // Stop moving player right
            moveRightRef.current = false;
          }
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("keyup", handleKeyUp);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("keyup", handleKeyUp);
      };
    }, [gameOver]);

    useEffect(() => {
      const gameContainer = gameContainerRef.current;
      let intervalId;
      if (!gameOver) {
        intervalId = setInterval(() => {
          const newBlockPositions = blockPositions.map((position) => ({
            top: position.top + 10,
            left: position.left,
          }));

          if (Math.random() < 0.2) {
            newBlockPositions.push({
              top: 0,
              left: Math.floor(Math.random() * gameContainer.clientWidth),
            });
          }

          const updatedBlockPositions = newBlockPositions.filter(
            (position) => position.top < gameContainer.clientHeight - 20
          );

          setBlockPositions(updatedBlockPositions);

          const playerRect = {
            top: gameContainer.clientHeight - 20,
            left: playerPosition,
            right: playerPosition + 20,
            bottom: gameContainer.clientHeight,
          };
          const collided = updatedBlockPositions.some((position) => {
            const blockRect = {
              top: position.top,
              left: position.left,
              right: position.left + 20,
              bottom: position.top + 20,
            };
            return (
              playerRect.left < blockRect.right &&
              playerRect.right > blockRect.left &&
              playerRect.top < blockRect.bottom &&
              playerRect.bottom > blockRect.top
            );
          });

          if (collided) {
            clearInterval(intervalId);
            setGameOver(true);
          }

          if (moveLeftRef.current && playerPosition > 0) {
            // Move player left
            setPlayerPosition((prevPosition) => prevPosition - 10);
          } else if (
            moveRightRef.current &&
            playerPosition < gameContainer.clientWidth - 40
          ) {
            // Move player right
            setPlayerPosition((prevPosition) => prevPosition + 10);
          }
        }, 100);

        return () => {
          clearInterval(intervalId);
        };
      }
    }, [blockPositions, gameOver, playerPosition]);

    const renderBlocks = blockPositions.map((position, index) => (
      <div
        key={index}
        className="block"
        style={{ top: position.top, left: position.left }}
      ></div>
    ));

    return (
      <div className="game-container" ref={gameContainerRef}>
        <div
          className="player"
          style={{ left: playerPosition }}
        ></div>
        {renderBlocks}
        {gameOver && (
          <div className="game-over">
            Game Over!
            <Link to="/" className="error__bttn">
                Homepage
            </Link>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="box__error-page">
      {showGame ? (
        <Game />
      ) : (
        <>
          <h1>Error 404</h1>
          <p className="error__description">
            Hi, this page doesn't exist, but you can make it{" "}
            <span onClick={handleClick}>useful</span>! But how? :)
          </p>
          <Link to="/" className="error__bttn">
            Homepage
          </Link>
        </>
      )}
    </div>
  );
};

export default ErrorPage;