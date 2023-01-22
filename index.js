
import fs from 'node:fs'
import express from 'express';
import fetch from 'node-fetch';
import redis from 'redis';
import cors from 'cors'
import { randomNum } from './func.js';

const PORT = process.env.PORT || 5000;
const REDIS_PORT = process.env.PORT || 6379;

const client = redis.createClient(REDIS_PORT);
const app = express();
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:true}))

const setResponse = (user, repos)=>{
return `<h2>${user} has ${repos} in Github </h2>`
}
const getRepose = async(req, res, next)=>{
    
    try{
        const {username} = req.params
        const res_github = await fetch(`https://api.github.com/users/${username}`)
        console.log(res_github)
        const data = await res_github.json();
        
        const repos = data.public_repos


        // set data to radis
        client.setEx(username, 3600, repos)

        res.send(setResponse(username, repos))

    }catch(err){
        console.error(err)
        res.send('server error')
        res.status(500)
    }
}

app.get(`/repos/:username`, getRepose)

app.post('/send-otp', (req, res)=>{
    const expectedPassw = fs.readFileSync('./passwordfile.txt', 'utf-8')
    const {password} = req.body
    const randomOTP = randomNum();
    
    fs.writeFileSync('otpfile.txt', randomOTP, 'utf8')

    if(expectedPassw === password){
        return setTimeout(()=>{
            res.json({data:{msg:'OTP is sent to your registered email', otp:randomOTP, status:'ok'}})
        },[1000])
    } else{
        return setTimeout(()=>{
            res.json({data:{msg:'Invalid password'}})
        },[1000]) 
    }
   
})

app.post('/validate-otp', (req, res)=>{
    const {otp, new_password, confirm_new_password} = req.body
    const savedOTP = fs.readFileSync('otpfile.txt', 'utf-8')
    if(otp === savedOTP){
        if(new_password !== confirm_new_password){
            return setTimeout(()=>{
                res.json({data:{msg:'Password not matched'}})
            },[1000])
        }
        fs.writeFileSync('passwordfile.txt', new_password, 'utf-8')
        return setTimeout(()=>{
            res.json({data:{msg:'Password changed successfully', status:'ok'}})
        },[1000])
    }
    return setTimeout(()=>{
        res.json({data:{msg:'Please put correct otp'}})
    },[1000])
})




app.listen(PORT, ()=>console.log(`server is running at ${PORT}`))