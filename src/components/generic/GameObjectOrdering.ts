import { GameObjectData } from "../data/BalatroUtils"


export const updateGameObjectIds = function <GameObjectType extends GameObjectData> (
  changedObject : GameObjectType,
  data : GameObjectType[],
  changeType : string,
  newId : number,
  direction? : string,
  oldId? : number,
) {
  data.forEach(object =>{
    const currentId = object.orderValue
    if (changeType == 'insert') {
      if (currentId >= newId && object.id !== changedObject.id) {
        object.orderValue += 1 }
      }
    if (changeType == 'change') {
      if (direction == 'increase'){
        if (currentId <= newId && currentId > (oldId||0) && object.id !== changedObject.id) {
          object.orderValue -= 1 }
        }
      else if (direction == 'decrease') {
        if (currentId >= newId && currentId < (oldId||data.length+1) && object.id !== changedObject.id) {
          object.orderValue += 1 }
        }
      }
    if (changeType == 'remove') {
      if (currentId >= newId && object.id !== changedObject.id) {
        object.orderValue -= 1 }
      }
  })

    return data
}

export const scanGameObjectIds = function <GameObjectType extends GameObjectData> (
  data: GameObjectType[]
) {
  const missingValues = locateMissingIds(data)
  const objectData = data

  if (missingValues.length == 0) {return data}

  missingValues.forEach(value=>{
    const objectIndex: number = locateWrongId(data)
    if (!isNaN(objectIndex)) {
      objectData[objectIndex].orderValue = value
    }
  })

  return objectData
}

export const locateMissingIds = function <GameObjectType extends GameObjectData> (
  data:GameObjectType[]
) {
  const objectData = data
  const listOfValues : Array <number> = []
  const missingValues : Array <number> = []

  objectData.forEach(object => listOfValues.push(object.orderValue))
  listOfValues.sort((a,b) => a - b)
  
  for (let i=0; i < listOfValues.length; i++) { 
    if (listOfValues[i] !== i + 1) {
      missingValues.push(i + 1)
    }
  }

  return missingValues
}

export const locateWrongId = <GameObjectType extends GameObjectData> (
  data:GameObjectType[]
) => {
  const objectData = data
  let wrongIndex = NaN

  objectData.forEach(object => {
    if (isNaN(wrongIndex)) {
      if (!object.orderValue) {
        wrongIndex = objectData.indexOf(object)
      }
      else if (!(object.orderValue <= objectData.length && object.orderValue > 0)) {
        wrongIndex = objectData.indexOf(object)
      }
      else if (Number.isNaN(object.orderValue)) {
        wrongIndex = objectData.indexOf(object)
      }
      else if (data.some((item) => item.orderValue == object.orderValue && item.name !== object.name)) {
        wrongIndex = objectData.indexOf(object)
      }}
    })
  
  return wrongIndex
}

const generateKeyFromName = <GameObjectType extends GameObjectData> (
  object: GameObjectType,
) : string => {

    return (
      object.name
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .replace(/\s+/g, "_")
        .replace(/^[0-9]+/, "") || `${object.objectType}`
    );
  };

export const getObjectName = <GameObjectType extends GameObjectData> (
  object : GameObjectType,
  data : GameObjectType[],
  value? : string,
) => {
  let newNumber:number | boolean | string
  let tempName:string = ''
  let currentName 
  let dupeName:string | null = value || null

  if (dupeName && !data.some(
    dataObject => dataObject.objectKey == dupeName && 
    object.id !== dataObject.id
  )) {
    return dupeName
  }

  while (true){
    let count:number = 0
    let looping = true

    currentName = dupeName || (object.objectKey !== "" ? object.objectKey : generateKeyFromName(object))

    tempName = currentName

    while (looping == true){
      const match = tempName.match(/\d+$/) 
      if (match) {
        tempName = tempName.slice(0,-1)
        count += 1
      } else { looping = false }
    }

    if (count > 0) {
      newNumber = Number(currentName.substring(
        currentName.length - Number(count), currentName.length)) + 1
      }
    else {newNumber = false} 

    if (newNumber !== false) {
      dupeName = currentName.slice(0, -count) + String(newNumber)
    }
    else {dupeName = currentName+'2'}

    if (dupeName && !data.some(
      dataObject => dataObject.objectKey == dupeName && 
      object.id !== dataObject.id
    )) {
      return dupeName
    }
}}

export const scanGameObjectKeys = <GameObjectType extends GameObjectData> (
  data:GameObjectType[]
) => {
  const wrongObjects: Array <GameObjectType> = []

  data.forEach(object1 => {
    data.forEach(object2 => {
      if ((object1.objectKey == object2.objectKey && object1.orderValue > object2.orderValue) || 
          object1.objectKey === "")
        {
        wrongObjects.push(object1)
      }
    })
  })
  
  wrongObjects.forEach(object =>
    object.objectKey = getObjectName(object, data, object.objectKey)
  )

  return data
}