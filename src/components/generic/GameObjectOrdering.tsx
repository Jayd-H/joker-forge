import { GameObjectData } from "../data/BalatroUtils"


export const updateGameObjectIds = function(
  changedObject:GameObjectData,
  data:GameObjectData[],
  changeType:string,
  newId:number,
  direction?:string,
  oldId?:number,
){data.forEach(object =>{
    const currentId = object.orderValue
    if (changeType == 'insert'){
      if (currentId >= newId && object.id !== changedObject.id){
        object.orderValue += 1 }}
    if (changeType == 'change'){
      if (direction == 'increase'){
        if (currentId <= newId && currentId > (oldId||0) && object.id !== changedObject.id){
          object.orderValue -= 1 }}
      else if (direction == 'decrease'){
        if (currentId >= newId && currentId < (oldId||data.length+1) && object.id !== changedObject.id){
          object.orderValue += 1 }}}
    if (changeType == 'remove'){
      if (currentId >= newId && object.id !== changedObject.id){
        object.orderValue -= 1 }}
  })
  return data as any
}

export const scanGameObjectIds = function(
  data:GameObjectData[]){
  const missingValues = locateMissingIds(data)
  const objectData = data
  if (missingValues.length == 0){return data}
  missingValues.forEach(value=>{
    const objectIndex:number = locateWrongId(data)
    objectData[objectIndex].orderValue = value
  })
  return objectData as any
}

export const locateMissingIds = function(
  data:GameObjectData[]){
  const objectData = data
  let listOfValues:Array <number> = []
  objectData.forEach(object => listOfValues.push(object.orderValue))
  listOfValues.sort((a,b)=>a-b)
  let missingValues:Array <number> =[]
  for (let i=0;i<listOfValues.length;i++){ 
    if (listOfValues[i]!==i+1){
      missingValues.push(i+1)
  }}
  return missingValues
}

export const locateWrongId = function(
  data:GameObjectData[]){
  const objectData = data
  let wrongIndex = NaN
  objectData.forEach(object => {
    if (isNaN(wrongIndex)){
      if (!object.orderValue){
        wrongIndex = objectData.indexOf(object)}
      else if (!(object.orderValue <= objectData.length && object.orderValue>0)){
        wrongIndex = objectData.indexOf(object)}
      else if (Number.isNaN(object.orderValue)){
        wrongIndex = objectData.indexOf(object)}
      else if (data.some((item) => item.orderValue == object.orderValue && item.name !== object.name)){
        wrongIndex = objectData.indexOf(object)}}})
  return wrongIndex
}

export const getObjectName = (
  object : GameObjectData,
  data:GameObjectData[],
  value?:string,
)=>{
  let newNumber:number|boolean|string
  let tempName:string = ''
  let currentName 
  let dupeName:string|null = value||null
  if (dupeName && !data.some(dataObject => dataObject.objectKey == dupeName && object.id !== dataObject.id)){
    return dupeName}
  while (true){
    let count:number = 0
    let looping = true
    let match     
    currentName = dupeName || object.objectKey
    tempName = currentName
    while (looping == true){
      match = tempName.match(/\d+$/) 
      if (match){tempName=tempName.slice(0,-1), count +=1}
      else {looping=false}}
    if (count>0)
      {newNumber = Number(currentName.substring(currentName.length-Number(count),currentName.length))+1}
    else {newNumber = false} 
    if (newNumber !== false){
      dupeName = currentName.slice(0,-count)+String(newNumber)}
    else {dupeName = currentName+'2'}
    if (dupeName && !data.some(dataObject => dataObject.objectKey == dupeName && object.id !== dataObject.id)){
      return dupeName as any
}}}
