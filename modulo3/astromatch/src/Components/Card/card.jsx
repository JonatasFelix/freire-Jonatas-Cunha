import React, { useState, useEffect } from "react";
import axios from "axios";
import Coracao from "../../Img/heart.png";
import { ContainerCard, BoxTelas, BoxHeader, EmptyBox, BoxLogo, Button } from "../Card/style";
import { BsFillPeopleFill } from "react-icons/bs";
import { AiFillWechat } from "react-icons/ai";

export default function Card(props) {

    const Botao = () => {
        return (
            props.pagina === "inicio" ? (
                <Button onClick={() => props.mudarTela("Matchs")}><AiFillWechat size="30px" color="#BCBBC0"/></Button>
            ) : (
                <Button onClick={() => props.mudarTela("inicio")}><BsFillPeopleFill size="30px" color="#BCBBC0"/></Button>
            ))
    }

    const BtnLogo = () => {
        if (props.pagina === "Matchs") props.mudarTela("inicio");
    }

    return (
        <ContainerCard>
            <BoxHeader>
                <EmptyBox></EmptyBox>
                <BoxLogo onClick={BtnLogo}>
                    <img src={Coracao} alt="" />
                    {/* <AiFillHeart size={50} className="logo"/> */}
                    <h1 className="logo">Flinter</h1>
                </BoxLogo>
                <Botao />
            </BoxHeader>

            <BoxTelas>
                <props.tela />
            </BoxTelas>

        </ContainerCard>
    );
}