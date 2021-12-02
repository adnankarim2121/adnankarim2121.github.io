

var typing = new Typed (".animate",{
      strings:['a Graduate Student at the University of Calgary under the supervision of Dr Ryo Suzuki', '\na soon to be Husband to my lovely fiance Maira Ejaz','Adnan Karim'],
      //strings: ['Adnan Karim^1000\n `Adnan Karim` ^1000\n `Fetching from source...`'],
      typeSpeed:10,
      backSpeed:30,
      loop:false,
      onStart: function(self)
      {
      	var x = document.getElementById('trial')
      	x.style.display = 'none';
      },
      onComplete: function(self) 
      {

		var x = document.getElementById("keyboardParent")
		x.style.display = "block";
		// setInterval(function(){ alert("Hello"); }, 3000)

            // $("#keyboard").load("keyboard.html"); 



      }
   });




