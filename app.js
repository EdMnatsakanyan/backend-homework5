const express = require('express')
const fs = require('node:fs')
const path = require('node:path')

const app = express()
app.use(express.json())

const getUsers = () => {
    return fs.readFileSync(path.join(__dirname, 'users.json'), 'utf-8')
}
const setUsers = (users) => {
    fs.writeFileSync(path.join(__dirname, 'users.json'), JSON.stringify(users))
}

const getProducts = () => {
    return fs.readFileSync(path.join(__dirname, 'products.json'), 'utf-8')
}
const setProducts = (products) => {
    fs.writeFileSync(path.join(__dirname, 'products.json'), JSON.stringify(products))
}

const getOrders = () => {
    return fs.readFileSync(path.join(__dirname, 'orders.json'), 'utf-8')
}
const setOrders = (orders) => {
    fs.writeFileSync(path.join(__dirname, 'orders.json'), JSON.stringify(orders))
}

const areEqual = (obj1, obj2) => {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
  
    if (keys1.length !== keys2.length) {
      return false;
    }
  
    for (let key of keys1) {
      if (obj1[key] !== obj2[key]) {
        return false;
      }
    }
  
    return true;
}

const hasOnlyProperties = (obj, properties) => {
    const keys = Object.keys(obj);
  
    if (keys.length !== properties.length) {
      return false;
    }
  
    for (let key of keys) {
      if (!properties.includes(key)) {
        return false;
      }
    }
  
    return true;
  }
  

app.post('/users/register',(req, res) => {
    const users = JSON.parse( getUsers() )
    const body = req.body

    if(! ('is_admin' in body) ) {
        body.is_admin = false
    }
    if(!hasOnlyProperties(body, ['username', 'email', 'password', 'is_admin'])){
        res.status(400).send({message:"wrong format"})
        return
    }
    if(users.some(elm => elm.email === body.email)) {
        res.status(400).send({message:'account with that email already exists'})
        return
    }
    if(body.username.length < 3) {
        res.status(400).send({message:'username length must be at least 3'})
        return
    }
    if(body.password.length < 6) {
        res.status(400).send({message:'password length must be at least 6'})
        return
    }
    
    setUsers([...users, body])
    res.status(200).send(body)
})

app.post('/users/login', (req, res) => {
    const body = req.body
    const users = JSON.parse(getUsers())

    if(! ('is_admin' in body) ) {
        body.is_admin = false
    }
    if(!hasOnlyProperties(body, ['username', 'email', 'password', 'is_admin'])){
        res.status(400).send({message:"wrong format"})
        return
    }
    if( users.some(elm => areEqual(elm, body))) {
        res.status(200).send({message : `log in succesfuly ${body.username}`})
        return
    }

    res.status(404).send({message: 'user not found'})
})

app.get('/products', (req, res) => {
    res.status(200).send( JSON.parse( getProducts() ) )
})

app.post('/products', (req, res) => {
    const body = req.body
    const products = JSON.parse( getProducts() )

    if(! ('is_active' in body) ){
        body.is_active = true
    } 
    if(!hasOnlyProperties(body, ['name', 'description', 'price', 'category', 'image_url','is_active'])){
        res.status(400).send({message:"wrong format"})
        return
    }
    if(body.name.length < 1) {
        res.status(400).send({message:"name length must be at least 1"})
        return
    }
    if(body.price <= 0) {
        res.status(400).send({message:"price must be more than 1"})
        return
    }
    if(products.some(elm => areEqual(elm, body))) {
        res.status(400).send({message:"that product already exists"})
        return
    }

    setProducts([...products, body])
    res.status(200).send(body)
})

app.get('/orders', (req, res) => {
    res.status(200).send(JSON.parse( getOrders() ))
})

app.post('/orders', (req, res) => {
    const body = req.body
    const orders = JSON.parse( getOrders() )
    const allProducts = JSON.parse( getProducts() )

    if( !('status' in body) ) {
        body.status = 'PENDING'
    }
    if(!hasOnlyProperties(body, ['user_id', 'products', 'total_price', 'status'])){
        res.status(400).send({message:"wrong format"})
        return
    }
    for(let i = 0; i < body.products.length; i++) {
        if( !(allProducts.some(elm => elm.name === body.products[i])) ) {
            res.status(400).send({message:"not all products exists"})
            return
        }
    }
    if(body.total_price <= 0) {
        res.status(400).send({message:"total price must be greater 0"})
        return
    } 

    setOrders([...orders, body])
    res.status(200).send(body)
})

app.listen( 3001, '0.0.0.0', () => {
    console.log(`server start ` )
})

