var api = {
    readAll: (output, url) => {
        fetch(url
            ,{
         method: 'GET',
             mode: "cors",
             headers: {
                 'Accept': 'application/json',
                 'Content-Type': 'application/json',
             },
             }).then(response => {
                 if (!response.ok) {
                    throw new Error('Network response was not ok');
                 }
                 return response.json();
             }).then(newUserData => {
                 if ((newUserData.status === 200)&&(output != null)){
                    output.value = newUserData.data;
                 }
             }).catch(error => {
                 console.error('Error:', error);
             });
    },
    create: (output, url, body_parameters) => {
        fetch(url
            ,{
                    body: JSON.stringify(body_parameters),
                method: 'POST',
                    mode: "cors",
                headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
            }).then(response => {
                 if (!response.ok) {
                    throw new Error('Network response was not ok');
                 }
                 return response.json();
            }).then(newUserData => {
                 if ((newUserData.status === 200)&&(output != null)){
                    output.value = newUserData.data;
                 }
            }).catch(error => {
                 console.error('Error:', error);
            });
    },
    read: (output, url, param_id) => {
        // fetch here
        fetch(url + "/" + param_id
            ,{
              method: 'GET',
                mode: "cors",
             headers: {
                 'Accept': 'application/json',
                 'Content-Type': 'application/json',
             },
             })
             .then(response => {
                 if (!response.ok) {
                 throw new Error('Network response was not ok');
                 }
                 return response.json();
             })
             .then(newUserData => {
                 if ((newUserData.status === 200)&&(output != null)){
                    output.value = newUserData.data;
                 }
             })
             .catch(error => {
                 console.error('Error:', error);
             });
    },
    update: (output, url, param_id, body_parameters) => {
        fetch(url + "/" + param_id
            ,{
                body: JSON.stringify(body_parameters),
              method: 'PUT',
                mode: "cors",
             headers: {
                       'Accept': 'application/json',
                 'Content-Type': 'application/json',
             },
             })
             .then(response => {
                 if (!response.ok) {
                 throw new Error('Network response was not ok');
                 }
                 return response.json();
             })
             .then(newUserData => {
                 if ((newUserData.status === 200)&&(output != null)){
                    output.value = newUserData.data;
                 }
             })
             .catch(error => {
                 console.error('Error:', error);
             });
    },
    delete: (output, url, param_id) => {
        fetch(url + "/" + param_id
            ,{
              method: 'DELETE',
                mode: "cors",
             headers: {
                       'Accept': 'application/json',
                 'Content-Type': 'application/json',
             },
             })
             .then(response => {
                 if (!response.ok) {
                 throw new Error('Network response was not ok');
                 }
                 return response.json();
             })
             .then(newUserData => {
                 if ((newUserData.status === 200)&&(output != null)){
                    output.value = newUserData.data;
                 }
             })
             .catch(error => {
                 console.error('Error:', error);
             });
    },
}
export default api;