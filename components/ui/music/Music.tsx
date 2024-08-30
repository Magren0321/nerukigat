export const Music = ({ id } : { id:string}) =>{
  return(
    <>
      <iframe width="100%" height="86" src={`//music.163.com/outchain/player?type=2&id=${id}&auto=1&height=66`}></iframe>
    </>
  )
}
