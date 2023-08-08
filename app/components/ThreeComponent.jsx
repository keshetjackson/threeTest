import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { ObjectLoader } from 'three';
import { DragControls } from 'three/examples/jsm/controls/DragControls';

const canvaStyle = { height: '30rem' };
const buttonStyle = {display: 'block', fontSize:'50px' }

function useDraggable(ref, index, elements) {
  const { camera, gl } = useThree();
  const controls = useRef();
  const [parentPos, setParentPos] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    if (!ref.current) return;

    controls.current = new DragControls([ref.current], camera, gl.domElement);
    controls.current.addEventListener('drag', (event) => {
      const prevElement = elements[index - 1]?.current;
      if (index > 0 && prevElement) {
        setParentPos(prevElement.position);
        const distance = event.object.position.distanceTo(prevElement.position);
        if (distance > 2) {
          event.object.position.set(
            (event.object.position.x - prevElement.position.x) * 2 / distance + prevElement.position.x,
            (event.object.position.y - prevElement.position.y) * 2 / distance + prevElement.position.y,
            (event.object.position.z - prevElement.position.z) * 2 / distance + prevElement.position.z
          );
        }
      } else {
        setParentPos({ x: 0, y: 0, z: 0 });
      }
    });

    return () => controls.current.dispose();
  }, [ref, camera, gl, index, elements]);

  return parentPos;
}

const Pyramid = ({ index, elements, position }) => {
  const meshRef = useRef();
  useDraggable(meshRef, index, elements);
  return (
    <mesh ref={meshRef} position={position}>
      <coneGeometry args={[1, 2, 4]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
};

const Digit = ({ index, elements, position }) => {
  const meshRef = useRef();
  useDraggable(meshRef, index, elements);
  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="blue" />
    </mesh>
  );
};

const Connector = ({ startRef, endRef }) => {
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
};

const ElementButton = ({ type, onAdd }) => (
  <button style={buttonStyle} onClick={() => onAdd(type)}>Add {type.charAt(0).toUpperCase() + type.slice(1)}</button>
);

export function ThreeComponent() {
  const [elements, setElements] = useState([]);
  const elementRefs = useRef([]);

  const addElement = useCallback((type) => {
    setElements(prev => [...prev, { type }]);
    elementRefs.current.push(React.createRef());
  }, []);

  const deleteElement = useCallback((index) => {
    setElements(prev => prev.slice(0, index));
  }, []);

  return (
    <div>
      <Canvas style={canvaStyle}>
        <ambientLight />
        <pointLight position={[100, 100, 100]} />
        {elements.map((el, index) => {
          const Element = el.type === 'pyramid' ? Pyramid : Digit;
          return (
            <React.Fragment key={index}>
              <Element ref={elementRefs.current[index]} index={index} elements={elementRefs.current} />
              {index > 0 && <Connector startRef={elementRefs.current[index - 1]} endRef={elementRefs.current[index]} />}
            </React.Fragment>
          );
        })}
      </Canvas>
      <ElementButton type="pyramid" onAdd={addElement} />
      <ElementButton type="digit" onAdd={addElement} />
      {elements.map((el, index) => (
        <button style={buttonStyle} key={index} onClick={() => deleteElement(index)}>Delete {el.type}</button>
      ))}
    </div>
  );
}

export default ThreeComponent;
