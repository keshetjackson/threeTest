import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { ObjectLoader } from 'three';
import { DragControls } from 'three/examples/jsm/controls/DragControls';

function useDraggable(ref, index, elements) {
  const { camera, gl } = useThree();
  const controls = useRef();
  const [parentPos, setParentPos] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    if (ref.current) {
      controls.current = new DragControls([ref.current], camera, gl.domElement);

      controls.current.addEventListener('drag', (event) => {
        if (index > 0 && elements[index - 1] && elements[index - 1].current) {
          const prevElement = elements[index - 1].current;
          setParentPos(prevElement.position);
          const distance = event.object.position.distanceTo(prevElement.position);
          const maxDistance = 2; 

          if (distance > maxDistance) {
            event.object.position.set(
              (event.object.position.x - prevElement.position.x) * maxDistance / distance + prevElement.position.x,
              (event.object.position.y - prevElement.position.y) * maxDistance / distance + prevElement.position.y,
              (event.object.position.z - prevElement.position.z) * maxDistance / distance + prevElement.position.z
            );
          }
        } else if (index === 0) {
          setParentPos({ x: 0, y: 0, z: 0 });
        }
      });

      return () => controls.current.dispose();
    }
  }, [ref, camera, gl, index, elements]);

  return parentPos;
}

function Pyramid(props) {
  const meshRef = useRef();
  useDraggable(meshRef, props.index, props.elements);
  return (
    <mesh ref={meshRef} position={props.position}>
      <coneGeometry args={[1, 2, 4]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
}

function Digit(props) {
  const meshRef = useRef();
  useDraggable(meshRef, props.index, props.elements);
  return (
    <mesh ref={meshRef} position={props.position}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="blue" />
    </mesh>
  );
}

function Connector(props) {
  const { startRef, endRef } = props;
  const lineRef = useRef();

  useFrame(() => {
    if (lineRef.current && startRef.current && endRef.current) {
      const startPoint = new THREE.Vector3().copy(startRef.current.position);
      const endPoint = new THREE.Vector3().copy(endRef.current.position);
      lineRef.current.geometry.setFromPoints([startPoint, endPoint]);
      lineRef.current.geometry.verticesNeedUpdate = true;
    }
  });

  return (
    <line ref={lineRef}>
      <bufferGeometry attach="geometry" />
      <lineBasicMaterial color="white" />
    </line>
  );
}

export function ThreeComponent() {
  const [elements, setElements] = useState([]);
  const elementRefs = useRef([]);

  const addElement = (type) => {
    const newElement = {
      type: type,
    };
    setElements(prev => {
      elementRefs.current.push(React.createRef());
      return [...prev, newElement];
    });
  };

  const deleteElement = (index) => {
    setElements(prev => prev.slice(0, index));
  };


  

 

  return (
    <div>
      <Canvas style={{height: '30rem'}}>
        <ambientLight />
        <pointLight position={[100, 100, 100]} />
        {elements.map((el, index) => {
          let element;
          if (el.type === 'pyramid') {
            element = <Pyramid key={index} ref={elementRefs.current[index]} index={index} elements={elementRefs.current} />;
          } else if (el.type === 'digit') {
            element = <Digit key={index} ref={elementRefs.current[index]} index={index} elements={elementRefs.current} />;
          }

          let connector;
          if (index > 0 && elementRefs.current[index - 1] && elementRefs.current[index - 1].current) {
            connector = <Connector startRef={elementRefs.current[index - 1]} endRef={elementRefs.current[index]} />;
          }

          return (
            <React.Fragment key={index}>
              {element}
              {connector}
            </React.Fragment>
          );
        })}
      </Canvas>
      <button onClick={() => addElement('pyramid')}>Add Pyramid</button>
      <br/>
      <button onClick={() => addElement('digit')}>Add Digit</button>
      <br/>
      {elements.map((el, index) => (
        <button style={{display: 'block'}} key={index} onClick={() => deleteElement(index)}>Delete {el.type}</button>
      ))}
    </div>
  );
}

export default ThreeComponent;
