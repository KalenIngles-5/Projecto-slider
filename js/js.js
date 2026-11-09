  let btnNext = document.querySelector(".next") 
  let btnBack = document.querySelector(".prev")
  
  let container = document.querySelector(".container")
  let list = document.querySelector(".container .list") 
  let thumb = document.querySelector(".container .thumb")
 
  btnNext.onclick = ( ) => moveItemsOnclick("next")  
  btnBack.onclick = ( ) => moveItemsOnclick("prev")  

  function moveItemsOnclick (type) { 
      let listItems = document.querySelectorAll(".list-items")
       let thumbItems = document.querySelectorAll(".thumb-item") 

      

      if(type === "next")  {
        list.appendChild(listItems[0])
        thumb.appendChild(thumbItems[0])
        container.classList.add("next")

       
      }else{
        if(type === "prev") {
          list.prepend(listItems[listItems.length -1])
          thumb.prepend(thumbItems[thumbItems.length - 1])
          container.classList.add("back")
         

        }
      }  

          
}
 



  

 
